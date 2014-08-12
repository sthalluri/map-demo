var map, cartoDBConnection;

$(function() {
    var defaultMapOptions = {
        zoom: 20, // Street Level Zoom
        center: new google.maps.LatLng(base.default_latitude, base.default_longitude) // Solution Street Office
    };

    map = new google.maps.Map(document.getElementById('map'), defaultMapOptions);

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
            cartocss : css
        } ]
    }, {
        https : true
    }).addTo(map)
      .on('done', function() {
        // Perform post-done actions
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
