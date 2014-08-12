var map, currentInfoWindow, markerBounds;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    markerBounds = new google.maps.LatLngBounds(); // <--- Create the LatLngBounds

    loadProperties();

    map.fitBounds(markerBounds); // <--- Now update the map to display the extent of the markers that have been added
});

function loadProperties() {
    $.ajax({
        type : 'GET',
        url : 'properties.json'
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

    markerBounds.extend(location); // <--- add this location to the LatLngBounds to update the extent

    infoWindow = new google.maps.InfoWindow({
        content : Mustache.render(base.property_infowindow_template, data)
    });

    infoWindow.addListener('closeclick', function() {
        infoWindow = null;
    });

    marker = new google.maps.Marker({
        position : location,
        map : this.map
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
