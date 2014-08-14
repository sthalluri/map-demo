var map, currentInfoWindow;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    addMarker(base.default_latitude, base.default_longitude);
});

function addMarker(latitude, longitude) {
    var marker, location, infoWindow;

    location = new google.maps.LatLng(
        parseFloat(latitude),
        parseFloat(longitude));

    infoWindow = new google.maps.InfoWindow({
        content : Mustache.render(base.default_infowindow_template, {
            title : 'Solution Street',
            street : '727 Elden Street',
            city : 'Herndon',
            state : 'VA',
            zip : '20170',
            phone : '(703) 657-0511',
            url : 'http://www.solutionstreet.com'
        })
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
