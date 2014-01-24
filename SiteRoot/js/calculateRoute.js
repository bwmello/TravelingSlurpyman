/* calculateRoute.js
 * Given one or two locations
 * author Brent Mello
 * lasted edited 1/22/2014
 */

function calcRoute() {
    setInitialRoute();
    drawCurrRoute();
    getCoordinates(setSearchArea); //Begins the callback chain, see the monster below
}

function setInitialRoute() {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;
    if(end === "") end = start;
    directionsRequest = { //Declared in the head of index.html
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[document.getElementById('mode').value], //DRIVING, BICYCLING, TRANSIT (w/ no waypoint support)
        unitSystem: google.maps.UnitSystem.IMPERIAL //IMPERIAL for miles, METRIC for km
    };
}

function drawCurrRoute() {
    directionsService.route(directionsRequest, function(response, status)
    {
        if (status === google.maps.DirectionsStatus.OK)
            directionsDisplay.setDirections(response);
        else
            alert("Unable to retrieve your route: " + status);
    });
}


/*  |   WARNING! Asynchronous code below, remove callback chain at own risk     |
 *  |   getCoordinates->setSearchArea->findStores->slurpyRoute                  |
 *  V   possible cosmetic alternatives: deferreds, queue                        V
 */
function getCoordinates(setSearchAreaCB) {
    var startCoords = new google.maps.LatLngBounds();
    var endCoords = new google.maps.LatLngBounds();
    geocoder.geocode( {'address':directionsRequest.origin}, function(results, status){
        if(status === google.maps.GeocoderStatus.OK)
            startCoords = results[0].geometry.location;
        else
            alert("Geocoding start location failure: " + status);
    });

    geocoder.geocode( {'address':directionsRequest.destination}, function(results, status){
        if(status === google.maps.GeocoderStatus.OK) {
            endCoords = results[0].geometry.location;
            setSearchAreaCB(startCoords, endCoords, findStores);
        }
        else
            alert("Geocoding end location failure: " + status);
    });
}

// TODO: the less distance between start and end, the greater the added search area.
function setSearchArea(startCoords, endCoords, findStoresCB) { //Ugh, revisit later.
    var topMost, botMost, rightMost, leftMost;
    if(startCoords.lat() >= endCoords.lat()) {  //1D = 69m, so .01D = .69m
        topMost = startCoords.lat()+.01; botMost = endCoords.lat()-.01; }
    else {
        topMost = endCoords.lat()+.01; botMost = startCoords.lat()-.01; }
    if(startCoords.lng() >= endCoords.lng()) {
        leftMost = endCoords.lng()-.01; rightMost = startCoords.lng()+.01; }
    else {
        leftMost = startCoords.lng()-.01; rightMost = endCoords.lng()+.01; }
    
    var swCorner = new google.maps.LatLng(botMost, leftMost);
    var neCorner = new google.maps.LatLng(topMost, rightMost);
    var searchArea =  new google.maps.LatLngBounds(swCorner, neCorner);
    findStoresCB(searchArea, slurpyRoute);
}

function findStores(searchArea, slurpyRouteCB) {
    var placesService = new google.maps.places.PlacesService(map);
    var allStores = [];
    placesService.nearbySearch({bounds:searchArea, keyword:"7-Eleven"}, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i=0; i<results.length && i<8; i++) {
                allStores.push({
                    location: results[i].geometry.location,
                    //stopover: false //Change if you'd rather work with suggested routes
                });
            };
            slurpyRouteCB(allStores);
        }
        else
            alert("Search for 7-Elevens failed: " + status);
    });
}

function slurpyRoute(allStores) {
    directionsRequest.waypoints = allStores;
    directionsRequest.optimizeWaypoints = true;
    drawCurrRoute();
    /*if(allStores.length > 1)
        prepRoute();
    else
        drawCurrRoute();*/
}


/* | Traveling SlurpyMan algorithm                                                  |
 * | Reduced to work with Google Map's optimizeWaypoints, which proved much faster  |
 * | Culls points based on distance and direction, formula explained in ReadMe      |
 * V                                                                                V
 */
var allPoints;
var allPointsCoords;
var strtLnDist;

function prepRoute() {
    allPoints = [directionsRequest.origin];
    alert("In prepRoute(), allPoints[0]: " + allPoints[0]);
    for(i=0; i<directionsRequest.waypoints.length; i++) {
        allPoints.push(directionsRequest.waypoints[i]);
    }
    allPoints.push(directionsRequest.destination);
    allPointsCoords = []; //Populated by cnvtToCoords()
    geocoder = new google.maps.Geocoder();
    cnvtToCoords(0);
}

function cnvtToCoords(i) {
    //geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address':allPoints[i]}, function(results, status){
        if(status === google.maps.GeocoderStatus.OK) {
            allPointsCoords[i] = results[0].geometry.location;
            alert(allPointsCoords[i]);
            if(i < allPoints.length-1)
                cnvtToCoords(i+1);
            else
                maxmzeRoute();
        }
        else
            alert("Geocoding end location failure: " + status);
    });
}

function maxmzeRoute() {
    var maxmzeWayPoints = [];
    strtLnDist = totalCoordsDiff(allPointsCoords[0], allPointsCoords[allPointsCoords.length-1]);
    alert("In maxmzeRoute, strtLnDist: " + strtLnDist);
    for(i=1; i<(allPoints.length-1); i++) {
        if(!skipPoint(i))
            maxmzeWayPoints.push(allPoints[i]);
    }
    directionsRequest.waypoints = maxmzeWayPoints;
    drawCurrRoute();
}

function skipPoint(i) {
    nextDist = totalCoordsDiff(allPointsCoords[i], allPointsCoords[i+1]);
    skipDist = totalCoordsDiff(allPointsCoords[i-1], allPointsCoords[i+1]);
    if(skipDist < nextDist) //modify by a factor of strtLnDist
        return false;
    else
        return true;
}

function totalCoordsDiff(coords1, coords2) {
    var totalDiff = 0;
    totalDiff += retDiff(coords1.lat(), coords2.lat());
    totalDiff += retDiff(coords1.lng(), coords2.lng());
    return totalDiff;
}

function retDiff(a, b){return (a > b)? a-b : b-a;}