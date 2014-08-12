$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    var map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);
});
