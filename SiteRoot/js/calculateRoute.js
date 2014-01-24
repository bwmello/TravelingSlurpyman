/* calculateRoute.js
 * Given one or two locations
 * author Brent Mello
 * lasted edited 1/24/2014
 */

var allPntCoords;
var strtLnDist;

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
var startCoords = new google.maps.LatLngBounds();
var endCoords = new google.maps.LatLngBounds();
    
function getCoordinates(setSearchAreaCB) {
    geocoder.geocode( {'address':directionsRequest.origin}, function(results, status){
        if(status === google.maps.GeocoderStatus.OK) {
            startCoords = results[0].geometry.location;
            geocoder.geocode( {'address':directionsRequest.destination}, function(results, status){
                if(status === google.maps.GeocoderStatus.OK) {
                    endCoords = results[0].geometry.location;
                    setSearchAreaCB(startCoords, endCoords, findStores);
                }
                else
                    alert("Geocoding end location failure: " + status);
            });
        }
        else
            alert("Geocoding start location failure: " + status);
    });
}

// TODO: the less distance between start and end, the greater the added search area.
function setSearchArea(startCoords, endCoords, findStoresCB) { //Ugh, revisit later.
    strtLnDist = totalCoordsDiff(startCoords, endCoords);
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
                    location: results[i].geometry.location
                    //stopover: false //Change to "true" if you'd rather work with suggested routes
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
    if(allStores.length > 1)
        prepRoute();
    else
        drawCurrRoute();
}


/* | Traveling SlurpyMan algorithm                                                  |
 * | Reduced to work with Google Map's optimizeWaypoints, which proved much faster  |
 * | Culls points based on distance and direction, formula explained in ReadMe      |
 * V                                                                                V
 */

function prepRoute() {
    allPntCoords = [startCoords];
    for(i=0; i<directionsRequest.waypoints.length; i++) {
        allPntCoords.push(directionsRequest.waypoints[i].location);
    }
    allPntCoords.push(endCoords);
    optmzeRoute();
}

function optmzeRoute() {
    var optmzeWayPoints = [];
    for(i=1; i<(allPntCoords.length-1); i++) {
        if(!skipPoint(i))
            optmzeWayPoints.push(directionsRequest.waypoints[i]);
    }
    directionsRequest.waypoints = optmzeWayPoints;
    drawCurrRoute();
}

function skipPoint(i) {
    nextDist = totalCoordsDiff(allPntCoords[i], allPntCoords[i+1]);
    skipDist = totalCoordsDiff(allPntCoords[i-1], allPntCoords[i+1]);
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