var map;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    addMarker(base.default_latitude, base.default_longitude);
});

function addMarker(latitude, longitude) {
    var marker, location;

    location = new google.maps.LatLng(
        parseFloat(latitude),
        parseFloat(longitude));

    marker = new google.maps.Marker({
        position : location,
        map : map
    });
}
