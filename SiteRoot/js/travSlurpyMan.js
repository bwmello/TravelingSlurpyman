/* travSlurpyMan.js
 * The main source file for the travelingSlurpyMan application
 * author Brent Mello
 * lasted edited 1/22/2014
 */

// Creates a default map of Chicago
function initializeMap() {
    var defaultMapOptions = {
        center: new google.maps.LatLng(41.85, -87.65),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), defaultMapOptions);
    directionsDisplay.setMap(map);
};


/*  |                                           |
 *  |   Below is the controller for index.html  |
 *  V                                           V
 */
function initialize (){
    initializeMap();
    
    if (typeof navigator.geolocation === "undefined") {
        $("#error").text("Your browser doesn't support the Geolocation API");
        return;
    } //Else if the browser supports the Geolocation API:
    $("#start-link, #end-link").click(function(event) {
        event.preventDefault();
        var addressId = this.id.substring(0, this.id.indexOf("-"));
        geocoder = new google.maps.Geocoder();
        navigator.geolocation.getCurrentPosition(function(position) {
            geocoder.geocode({
                "location": new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude)
            },
            function(results, status) {
                if (status === google.maps.GeocoderStatus.OK)
                    $("#" + addressId).val(results[0].formatted_address);
                else
                    $("#error").append("Unable to retrieve your address<br />");
            });
        },
        function(positionError){
            $("#error").append("Error: " + positionError.message + "<br />");
        },
        {
            enableHighAccuracy: true,
            timeout: 10 * 1000 //roughly 10 seconds
        });
    });
    
    $("#calculate-route").submit(function(event) {
        event.preventDefault();
        calcRoute();
    });
};
            
function travelMethodChange(start) {
    if( start !== "")
        calcRoute(start, document.getElementById('end').value);
}