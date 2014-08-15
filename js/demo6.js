var map, cartodbLayer, currentInfoWindow, cartoDBConnection;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        document.getElementById('radius_menu'));

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
            var subLayer = cartodbLayer.getSubLayer(0);

            subLayer.setInteraction(true); // <--- exposes layer data
            cdb.vis.Vis.addCursorInteraction(map, subLayer);
            subLayer.on('featureClick', function(e, latlng, pos, data, layerIndex) {
                closeCurrentInfoWindow();

                var markerInfo = addMarker(latlng, data);
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

function addMarker(latlng, data) {
    var marker, location, infoWindow;

    location = new google.maps.LatLng(
        parseFloat(latlng[0]),
        parseFloat(latlng[1]));

    infoWindow = new google.maps.InfoWindow({
        content : Mustache.render(base.property_infowindow_search_template, data)
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
    infoWindow.addListener('domready', function() {
        // Add the radius search event handling
        $('#radius_menu select').change(function(event) {
            var radius = $(this).val();
            if (radius != '') {
                doRadiusSearch(marker, radius);
            }
        });
    });

    infoWindow.open(map, marker);
    currentInfoWindow = infoWindow;
}

function closeCurrentInfoWindow() {
    if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
    }
}

// ------------------------------------------
// Radius Search Functions
// ------------------------------------------

function convertMilesToMeters(miles) {
    return miles * 1609.34;
}

function doRadiusSearch(marker, radius) {
    var lng = marker.getPosition().lng(),
        lat = marker.getPosition().lat(),
        radiusInMeters = convertMilesToMeters(radius), sql;

    // We convert from SRID 4326 (WGS84) to SRID 2163 (US National Atlas Equal Area)
    // b/c SRID 2163 is in meters and results in less distortion on US projections than SRID 4326
    sql = base.cartodb_property_sql + " where ST_DWithin(ST_Transform(the_geom, 2163), ST_Transform(ST_SetSRID('POINT(" + lng + " " + lat + ")'::geometry, 4326),2163), " + radiusInMeters + ")";

    // Update the current layer with the new query
    var subLayer = cartodbLayer.getSubLayer(0);
    subLayer.set({
        sql : sql,
        cartocss : base.cartodb_property_css,
        interactivity: 'cartodb_id, propaddr, parcelno'
    });

    closeCurrentInfoWindow();
    //updateExtent(sql);
}