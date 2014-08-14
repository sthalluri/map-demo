var map, cartodbLayer, currentInfoWindow, cartoDBConnection, drawingManager, currentSelectionRegion;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

    initMapDrawingMgr(); // <--- Add the drawing tools to the map

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
        content : Mustache.render(base.property_infowindow_template, data)
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

// ------------------------------------------
// Drawing functions
// ------------------------------------------
var selectionRegionPolyOptions = {
    strokeWeight: 3,
    fillOpacity: 0,
    strokeColor : '#ff0000',
    editable: true
};

function initMapDrawingMgr() {
    // Creates a drawing manager attached to the map that allows the user to draw
    // markers, lines, and shapes.
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControlOptions : {
            drawingModes : [ google.maps.drawing.OverlayType.RECTANGLE,
                             google.maps.drawing.OverlayType.CIRCLE,
                             google.maps.drawing.OverlayType.POLYGON ]
        },
        markerOptions: {
            draggable: true
        },
        polylineOptions: {
            editable: true
        },
        rectangleOptions: selectionRegionPolyOptions,
        circleOptions: 	  selectionRegionPolyOptions,
        polygonOptions:   selectionRegionPolyOptions,
        map: map
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        addOverlayEvents(e.type, e.overlay);
        processOverlayComplete(e.type, e.overlay);
    });
}

function processOverlayComplete(type, overlay, retainSelectionRegion) {
    if (type != google.maps.drawing.OverlayType.MARKER) {

        // Switch back to non-drawing mode after drawing a shape.
        drawingManager.setDrawingMode(null);

        // Remove the current selection region if any
        if (!retainSelectionRegion && currentSelectionRegion) {
            currentSelectionRegion.setMap(null);
        }

        currentSelectionRegion = overlay;
        currentSelectionRegion.type = type;

        // Update the current layer with the new query
        var subLayer = cartodbLayer.getSubLayer(0);
        subLayer.set({
            sql : getSelectionRegionSQL(),
            cartocss : base.cartodb_property_css,
            interactivity: 'cartodb_id, propaddr, parcelno'
        });
    }
}

function addOverlayEvents(type, overlay) {
    if (type == google.maps.drawing.OverlayType.CIRCLE) {
        google.maps.event.addListener(overlay, 'radius_changed', function(e) {
            processOverlayComplete(type, this, true);
        });

        google.maps.event.addListener(overlay, 'center_changed', function(e) {
            processOverlayComplete(type, this, true);
        });
    } else if (type == google.maps.drawing.OverlayType.RECTANGLE) {
        google.maps.event.addListener(overlay, 'bounds_changed', function(e) {
            processOverlayComplete(type, this, true);
        });
    } else {
        google.maps.event.addListener(overlay.getPath(), 'set_at', function(index) {
            processOverlayComplete(type, overlay, true);
        });
    }
}

function getSelectionRegionSQL() {
    var sql = null;

    if (currentSelectionRegion) {
        if (currentSelectionRegion.type == google.maps.drawing.OverlayType.CIRCLE) {
            var lng = currentSelectionRegion.getCenter().lng(),
                lat = currentSelectionRegion.getCenter().lat(),
                radius = currentSelectionRegion.getRadius();

            // We convert from SRID 4326 (WGS84) to SRID 2163 (US National Atlas Equal Area)
            // b/c SRID 2163 is in meters and results in less distortion on US projections than SRID 4326
            sql = base.cartodb_property_sql + " where ST_DWithin(ST_Transform(the_geom, 2163), ST_Transform(ST_SetSRID('POINT(" + lng + " " + lat + ")'::geometry, 4326),2163), " + radius + ")";
        } else if (currentSelectionRegion.type == google.maps.drawing.OverlayType.RECTANGLE) {
            var neLng, neLat, swLng, swLat;

            neLng = currentSelectionRegion.getBounds().getNorthEast().lng();
            neLat = currentSelectionRegion.getBounds().getNorthEast().lat();
            swLng = currentSelectionRegion.getBounds().getSouthWest().lng();
            swLat = currentSelectionRegion.getBounds().getSouthWest().lat();

            sql = base.cartodb_property_sql + " where the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(" + swLng + "," + swLat + "), ST_Point(" + neLng + "," + neLat + ")), 4326)";
        } else if (currentSelectionRegion.type == google.maps.drawing.OverlayType.POLYGON) {
            var isFirst=true, i, polygon = '', paths = currentSelectionRegion.getPath();

            for (i=0; i<paths.getLength(); i++) {
                if (!isFirst) {
                    polygon += ',';
                } else {
                    isFirst = false;
                }

                polygon += paths.getAt(i).lng();
                polygon += ' ';
                polygon += paths.getAt(i).lat();
            }

            // Complete the path
            polygon += ',';
            polygon += paths.getAt(0).lng();
            polygon += ' ';
            polygon += paths.getAt(0).lat();

            sql = base.cartodb_property_sql + " where ST_Within(the_geom, ST_GeomFromText('POLYGON((" + polygon + "))', 4326))";
        }

        return sql;
    }  else {
        return base.cartodb_property_sql;
    }
}