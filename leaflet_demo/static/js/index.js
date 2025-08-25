"use strict";

// globals
let g_tsdmlayer = null; 
let g_nbarlayer = null;
const g_url = 'https://tiles.pasturekey.cibolabs.com';

function init()
{
    const myDialog = document.getElementById('myDialog');
    myDialog.addEventListener('close', () => {
        const form = myDialog.querySelector('form');
        const token = form.querySelector('#token');
        const property_id = form.querySelector('#property_id');
        console.log('User entered:', token.value, property_id.value);
        
        // create map and zoom in on farm
        // TODO: can we get extents programmatically?
        let map = L.map('map').setView([-31.349912533186938, 150.13404649761717], 14);
        
        // background layer
        const OSMLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        OSMLayer.addTo(map);

        
        // get dates for this property_id
        fetch(g_url + '/getimagedates/' + property_id.value, {
            headers: {
                'Authorization': 'Bearer ' + token.value,
                'Accept': 'application/json'
           },
            method: "GET"})
        .then(response => response.json())
        .then(function(data) {
            const last_date = data.dates[data.dates.length - 1];
            g_tsdmlayer = new L.TileLayerHeaders(g_url + '/tsdm/' + last_date + '/' + property_id.value + '/{z}/{x}/{y}', {
                attribution: '&copy; <a href="https://www.cibolabs.com.au/">CiboLabs</a>',
                customHeaders: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'image/png'                            
                }
            });
            g_tsdmlayer.addTo(map);
            g_nbarlayer = new L.TileLayerHeaders(g_url + '/nbar/' + last_date + '/' + property_id.value + '/{z}/{x}/{y}', {
                attribution: '&copy; <a href="https://www.cibolabs.com.au/">CiboLabs</a>',
                customHeaders: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'image/png'                            
                }
            });
            
            // dates
            let slider = L.control.slider(function(value) {
                newLabel(data.dates[value], map);
            }, {'position': 'bottomright', 'max': data.dates.length - 1, 
              'value': data.dates.length - 1,
              'orientation': 'horizontal', 'size': '1000px', 'collapsed': false,
              'getValue': function(value){return data.dates[value]}});
            slider.addTo(map);
            
            // layer control
            let basemap = {"OpenStreetMap": OSMLayer};
            let cibolayers = {"TSDM": g_tsdmlayer,
                "NBAR": g_nbarlayer};
            let layerControl = L.control.layers(basemap, cibolayers).addTo(map);
        });
    });   
    myDialog.showModal();
}

function newLabel(label, map)
{
    const form = myDialog.querySelector('form');
    const property_id = form.querySelector('#property_id');
    if( g_tsdmlayer )
    {
        g_tsdmlayer.setUrl(g_url + '/tsdm/' + label + '/' + property_id.value + '/{z}/{x}/{y}');
    }
    if( g_nbarlayer )
    {
        g_nbarlayer.setUrl(g_url + '/nbar/' + label + '/' + property_id.value + '/{z}/{x}/{y}');
    }
}
