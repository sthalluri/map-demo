base = {
    default_latitude  : 38.969489,
    default_longitude : -77.385645,

    default_infowindow_template : '<div class="infoWindow"></div><h3>{{title}}</h3>{{street}}<br/>{{city}}, {{state}} {{zip}}<br/>{{phone}}<br/><a href="{{url}}">{{url}}</a></div>',
    property_infowindow_template : '<div class="infoWindow"></div><h3>{{addr}}<br/></h3>{{parcel_number}}</div>',

    cartodb_user : 'ghodum',

    cartodb_property_sql : 'select * from detroit_parcels',
    cartodb_property_css : '#detroit_parcels{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1.5; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }'
};
