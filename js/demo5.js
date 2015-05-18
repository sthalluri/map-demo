var map, cartodbLayer, currentInfoWindow, cartoDBConnection, futureUserLayer;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push($('#layer_menu')[0]);

    $('#layer_menu input[type=checkbox]').change(function(){
        ($(this).is(':checked')) ? addFutureUseLayer() : removeFutureUseLayer();
    });


    cartoDBConnection = new cartodb.SQL({
        user: base.cartodb_user,
        https: true
    });

    loadProperties(base.cartodb_property_sql, base.cartodb_property_css);
    updateExtent(base.cartodb_property_sql);
});

function loadProperties(sql, css) {
    cartodb.createLayer(map, {
        user_name : base.cartodb_user,
        type : 'cartodb',
        sublayers : [ {
            sql : sql,
            cartocss : css,
            interactivity: 'cartodb_id, propaddr, parcelno'
        } ]
    }, {
        https : true
    }).addTo(map)
        .on('done', function(layer) {
            // Perform post-done actions
            cartodbLayer = layer;
            var subLayer = layer.getSubLayer(0);
            subLayer.setInteraction(true); // <--- exposes layer data
            cdb.vis.Vis.addCursorInteraction(map, subLayer);
            subLayer.on('featureClick', function(e, latlng, pos, data, layerIndex) {
                closeCurrentInfoWindow();

                var markerInfo = addMarker(latlng, data, base.property_infowindow_template);
                showInfoWindow(markerInfo.marker, markerInfo.infoWindow);
            });
        })
        .on('error', function() {
            this.alert('Map Error', 'There was a fatal error loading the map.');
        });
}

function updateExtent(sql) {
    cartoDBConnection.getBounds(sql).done( function(bounds) {
        var google_bounds = new google.maps.LatLngBounds();
        google_bounds.extend(new google.maps.LatLng(bounds[0][0], bounds[0][1]));
        google_bounds.extend(new google.maps.LatLng(bounds[1][0], bounds[1][1]));
        map.fitBounds(google_bounds);
    });
}


// ---------------------------------------
// Marker functions
// ---------------------------------------

function addMarker(latlng, data, template) {
    var marker, location, infoWindow;

    location = new google.maps.LatLng(
        parseFloat(latlng[0]),
        parseFloat(latlng[1]));

    infoWindow = new google.maps.InfoWindow({
        content : Mustache.render(template, data)
    });

    infoWindow.addListener('closeclick', function() {
        currentInfoWindow = null;
    });

    marker = new google.maps.Marker({
        position : location,
        map : map,
        visible : false // <-- dont show a marker since we already have one on the cartodb layer
    });

    return {
        marker : marker,
        infoWindow : infoWindow
    }
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

// ---------------------------------------
// Add another layer to the map
// ---------------------------------------
function addFutureUseLayer() {
    removeFutureUseLayer();

    futureUserLayer = cartodbLayer.createSubLayer( {
        sql : base.cartodb_future_use_sql,
        cartocss : base.cartodb_future_use_css,
        interactivity: 'cartodb_id, mpdescription'
    });

    futureUserLayer.setInteraction(true); // <--- exposes layer data
    cdb.vis.Vis.addCursorInteraction(map, futureUserLayer);
    futureUserLayer.on('featureClick', function(e, latlng, pos, data, layerIndex) {
        closeCurrentInfoWindow();

        var markerInfo = addMarker(latlng, data, '<div class="infoWindow">{{mpdescription}}</div>');
        showInfoWindow(markerInfo.marker, markerInfo.infoWindow);
    });
}

function removeFutureUseLayer() {
    if (futureUserLayer) {
        closeCurrentInfoWindow();
        futureUserLayer.remove();
        futureUserLayer = null;
    }
}