var map, currentInfoWindow;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    loadProperties();
});

function loadProperties() {
    $.ajax({
        type : 'GET',
        url : 'data/properties.json'
    }).done(function(data) {
        if (data) {
            $.each(data, function(index, value) {
                addMarker(value);
            });
        }
    });
}

function addMarker(data) {
    var marker, location, infoWindow;

    location = new google.maps.LatLng(
        parseFloat(data.latitude),
        parseFloat(data.longitude));

    infoWindow = new google.maps.InfoWindow({
        content : Mustache.render(base.property_infowindow_template, data)
    });

    infoWindow.addListener('closeclick', function() {
        currentInfoWindow = null;
    });

    marker = new google.maps.Marker({
        position : location,
        map : map
    });

    google.maps.event.addListener(marker, 'click', function() {
        closeCurrentInfoWindow();
        showInfoWindow(marker, infoWindow);
    });
}

function showInfoWindow(marker, infoWindow) {
    infoWindow.open(map, marker);
    currentInfoWindow = infoWindow;
}

function closeCurrentInfoWindow() {
    if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
    }
}
