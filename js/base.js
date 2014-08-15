base = {
    default_latitude  : 38.969489,
    default_longitude : -77.385645,

    default_infowindow_template : '<div class="infoWindow"><h3>{{title}}</h3>{{street}}<br/>{{city}}, {{state}} {{zip}}<br/>{{phone}}<br/><a href="{{url}}">{{url}}</a></div>',
    property_infowindow_template : '<div class="infoWindow"><h3>{{propaddr}}<br/></h3>{{parcelno}}</div>',

    property_infowindow_search_template : '<div class="infoWindow"><h3>{{propaddr}}<br/></h3>{{parcelno}}<br/><br/><div id="radius_menu"><span>Search Radius:&nbsp;</span><select name="radius"><option value="" selected="selected"></option><option value=".10">.10</option><option value=".25">.25</option><option value=".5">.5</option><option value=".75">.75</option><option value="1">1</option><option value="2.5">2.5</option><option value="5">5</option></select></div></div>',

    // CartoDB Username (tables are assumed to be public)
    cartodb_user : 'ghodum',

    // Property Marker SQL/CartoCSS
    cartodb_property_sql : 'select * from detroit_parcels',
    //cartodb_property_sql : 'select * from detroit_parcels where propaddr like \'%NORTHFIELD%\' or propaddr like \'%COLFAX%\'',
    cartodb_property_css : '#detroit_parcels{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1.5; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }',

    // Property Boundary SQL/CartoCSS
    //cartodb_property_sql : 'select * from detroit_parcel_boundaries',
    //cartodb_property_css : '#detroit_parcel_boundaries{ polygon-fill: #F11810; polygon-opacity: 0.7; line-color: #000000; line-width: 1; line-opacity: 0.5; }'


    cartodb_future_use_sql: 'select * from future_use',
    cartodb_future_use_css : '#future_use {    polygon-opacity: 0.4;    line-color: #FFF;    line-width: 1;    line-opacity: 0; }  #future_use[mpdescription="General Commercial"] {    polygon-fill: #A6CEE3; } #future_use[mpdescription="Low-Medium Density Residential"] {    polygon-fill: #1F78B4; } #future_use[mpdescription="Residential / Local Commercial"] {    polygon-fill: #B2DF8A; } #future_use[mpdescription="General Industrial"] {    polygon-fill: #33A02C; } #future_use[mpdescription="Institutional"] {    polygon-fill: #FB9A99; } #future_use[mpdescription="Medium Density Residential"] {    polygon-fill: #E31A1C; } #future_use[mpdescription="Low Density Residential"] {    polygon-fill: #FDBF6F; } #future_use[mpdescription="Light Industrial"] {    polygon-fill: #FF7F00; } #future_use[mpdescription="Special Residential / Commercial"] {    polygon-fill: #CAB2D6; } #future_use[mpdescription="Special Commercial"] {    polygon-fill: #6A3D9A; } #future_use {    polygon-fill: #DDDDDD; }',
};