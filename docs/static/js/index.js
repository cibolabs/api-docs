"use strict";

// globals
let g_tsdmlayer = null; 
let g_nbarlayer = null;
const g_tileurl = 'https://tiles.pasturekey.cibolabs.com';
const g_pkeyurl = 'https://data.pasturekey.cibolabs.com';
let g_chart = null;

function init()
{
    const myDialog = document.getElementById('myDialog');
    myDialog.addEventListener('close', () => {
        const form = myDialog.querySelector('form');
        const token = form.querySelector('#token');
        const property_id = form.querySelector('#property_id');
        console.log('User entered:', token.value, property_id.value);
        
        // create map
        let map = L.map('map')
        
        // get the bounds of the entered farm
        fetch(g_tileurl + '/getbounds/' + property_id.value, {
                headers: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'application/json'
               },
                method: "GET"})
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(function(data) {
                map.fitBounds([[data.ymin, data.xmin], [data.ymax, data.xmax]]);
            })
            .catch(error => {
              console.error('Fetch error:', error);
            });
        
        // background layer
        const OSMLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        OSMLayer.addTo(map);

        
        // get dates for this property_id
        fetch(g_tileurl + '/getimagedates/' + property_id.value, {
            headers: {
                'Authorization': 'Bearer ' + token.value,
                'Accept': 'application/json'
           },
           method: "GET"})
          .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
           })
          .then(function(data) {
            const last_date = data.dates[data.dates.length - 1];
            g_tsdmlayer = new L.TileLayerHeaders(g_tileurl + '/tsdm/' + last_date + '/' + property_id.value + '/{z}/{x}/{y}', {
                attribution: '&copy; <a href="https://www.cibolabs.com.au/">CiboLabs</a>',
                customHeaders: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'image/png'                            
                }
            });
            g_nbarlayer = new L.TileLayerHeaders(g_tileurl + '/nbar/' + last_date + '/' + property_id.value + '/{z}/{x}/{y}', {
                attribution: '&copy; <a href="https://www.cibolabs.com.au/">CiboLabs</a>',
                customHeaders: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'image/png'                            
                }
            });
            g_nbarlayer.addTo(map); // displayed by default
            
            // and empty geojson layer to be populated later
            let geojsonLayer = L.geoJSON().addTo(map);
            
            // start a fetch do the property boundaries can be displayed when ready
            fetch(g_pkeyurl + '/geom/' + property_id.value, {
                headers: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'application/json'
               },
               method: "POST"})
               .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
              })
              .then(function(data) {
                geojsonLayer.addData(data);
              })
              .catch(error => {
                  console.error('Fetch error:', error);
              });

            
            // dates - make a slider
            let slider = L.control.slider(function(value) {
                newLabel(data.dates[value], map);
            }, {'position': 'bottomright', 'max': data.dates.length - 1, 
              'value': data.dates.length - 1,
              'orientation': 'horizontal', 'size': '1000px', 'collapsed': false,
              'getValue': function(value){return data.dates[value]}});
            slider.addTo(map);
            
            // layer control
            let groupedOverlay = {
                "CiboLabs": {
                    "TSDM": g_tsdmlayer,
                    "NBAR": g_nbarlayer
                },
                "Other": {
                    "Property Boundaries": geojsonLayer
                }
            };
            let basemap = {"OpenStreetMap": OSMLayer};
            let options = {
                exclusiveGroups: ["CiboLabs"]
            }
            let layerControl = L.control.groupedLayers(basemap, groupedOverlay, options).addTo(map);
            
            // do plot when the result of this fetch comes in
            fetch(g_pkeyurl + '/gettsdmstats/' + property_id.value, {
                headers: {
                    'Authorization': 'Bearer ' + token.value,
                    'Accept': 'application/json'
               },
                method: "POST"})
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(function(data) {
            
                // pull out the data for every paddock
                let paddock_data = [];
                let labels = null;
                for(const paddock of data.paddocks)
                {
                    const paddock_obj = {
                        'label': paddock.paddock_name,
                        'data': paddock.stats[0].median
                    };
                    paddock_data.push(paddock_obj);
                    
                    if(!labels) 
                    {
                      labels = [];
                      for(const datestr of paddock.stats[0].dates)
                      {
                          const year = datestr.substring(0,4);
                          const month = datestr.substring(4,6);
                          const day = datestr.substring(6,8);
                          labels.push(new Date(year, month-1, day));
                      }  
                    }
                }
            
                if(g_chart)
                {
                    g_chart.destroy();
                }
                
                // display this now there is data
                document.getElementById('plottitle').removeAttribute("hidden");
                
                const ctx = document.getElementById('plot');
                g_chart = new Chart(ctx, {
                    'type': 'line',
                    'data': {
                        'labels': labels,
                        'datasets': paddock_data
                    },
                    'options': {
                        'plugins': {
                            'legend': {
                                'display': false // This hides the legend
                            }
                        },
                        'scales': {
                            'x': {
                                'type': 'time',
                                'time': {
                                    'tooltipFormat':'dd/MM/yyyy',
                                    'displayFormats': {
                                        'unit': 'day',
                                        'day': 'd MMM yyyy'
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
               console.error('Fetch error:', error);
            });
        })
        .catch(error => {
           console.error('Fetch error:', error);
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
        g_tsdmlayer.setUrl(g_tileurl + '/tsdm/' + label + '/' + property_id.value + '/{z}/{x}/{y}');
    }
    if( g_nbarlayer )
    {
        g_nbarlayer.setUrl(g_tileurl + '/nbar/' + label + '/' + property_id.value + '/{z}/{x}/{y}');
    }
}
