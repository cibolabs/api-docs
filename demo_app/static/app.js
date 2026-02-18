"use strict";

// globals
let g_tsdmlayer = null; 
let g_nbarlayer = null;
let g_fclayer = null;
const g_tileurl = '/proxy/tiles/afm';
const g_dataurl = 'https://data.afm.cibolabs.com';

// Pasture Key globals
const g_pk_tileurl = '/proxy/tiles/pk';
let g_pk_tsdmlayer = null;
let g_pk_nbarlayer = null;
let g_pk_fclayer = null;
let g_pk_tsdmcompositlayer = null;
let g_pk_nbarcompositlayer = null;
let g_pk_fccompositlayer = null;
let g_pk_geom = null;
let g_pk_stats = null;
let g_pk_dates = null;
let g_afm_dates = null;
let currentPropertyId = null;

let layerControl = null;
let slider = null;
let currentDates = []; // Currently active dates array for slider
let lastMouseEvent = null;
let coordDiv = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. Initialize Map
    let map = L.map('map').setView([-25, 135], 4);

    // Background layer
    const googleHybrid = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '&copy; Google'
    });
    googleHybrid.addTo(map);

    // Scale Control
    L.control.scale().addTo(map);

    // Geocoder Control (Search Box)
    if (L.Control.Geocoder) {
        var geocoder = L.Control.geocoder ? L.Control.geocoder : function(options) { return new L.Control.Geocoder(options); };
        geocoder({
            defaultMarkGeocode: true,
            position: 'topleft'
        }).addTo(map);
    } else {
        console.error("Leaflet Geocoder plugin not loaded correctly.");
    }

    // Mouse Coordinate Control
    let coordControl = L.control({position: 'bottomright'});
    coordControl.onAdd = function(map) {
        coordDiv = L.DomUtil.create('div', 'coordinate-control');
        updateCoordDisplay(map);
        return coordDiv;
    };
    coordControl.addTo(map);

    map.on('mousemove', function(e) {
        lastMouseEvent = e;
        updateCoordDisplay(map);
    });

    // Farm Load Button
    document.getElementById('load-farm').addEventListener('click', function() {
        const propId = document.getElementById('farm-id').value.trim();
        if (propId) {
            loadFarm(map, propId);
        } else {
            alert("Please enter a Property ID");
        }
    });

    // 2. Start App
    startApp(map, googleHybrid);
}

function updateCoordDisplay(map) {
    if (!coordDiv) return;
    const date = window.currentDate || '-';
    let text = `Date: ${date}<br>Lat: -, Lng: -<br>Z: -, X: -, Y: -`;
    
    if (lastMouseEvent) {
        const e = lastMouseEvent;
        const zoom = map.getZoom();
        const point = map.project(e.latlng, zoom).divideBy(256).floor();
        text = `Date: ${date}<br>Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}<br>Z: ${zoom}, X: ${point.x}, Y: ${point.y}`;
    }
    coordDiv.innerHTML = text;
}

function startApp(map, baseLayer) {
    // 3. Fetch Dates from AFM API (via Proxy)
    fetch('/dates', {
        headers: { 'Accept': 'application/json' },
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        const dates = data.dates;
        if (!dates || dates.length === 0) {
            alert("No available dates found for AFM layers.");
            return;
        }
        
        g_afm_dates = dates;
        currentDates = dates; // Initialize with AFM dates
        const last_date = dates[dates.length - 1];
        window.currentDate = last_date; // Global date tracker

        console.log("Latest AFM date:", last_date);

        // 4. Setup AFM Layers
        g_tsdmlayer = L.tileLayer(g_tileurl + '/tsdm/' + last_date + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs AFM', maxNativeZoom: 12, maxZoom: 19
        });

        g_nbarlayer = L.tileLayer(g_tileurl + '/nbar/' + last_date + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs AFM', maxNativeZoom: 12, maxZoom: 19
        });
        
        g_fclayer = L.tileLayer(g_tileurl + '/fractionalcover/' + last_date + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs AFM', maxNativeZoom: 12, maxZoom: 19
        });

        g_tsdmlayer.addTo(map);

        // 5. Layer Control
        let groupedOverlay = {
            "AFM (National)": {
                "TSDM": g_tsdmlayer,
                "NBAR": g_nbarlayer,
                "Fractional Cover": g_fclayer
            },
            "Pasture Key (Farm)": {
                // Will be populated dynamically
            }
        };
        let basemap = {"Google Hybrid": baseLayer};
        let options = {
            exclusiveGroups: ["AFM (National)", "Pasture Key (Farm)"]
        }
        layerControl = L.control.groupedLayers(basemap, groupedOverlay, options).addTo(map);

        // 6. Slider
        setupSlider(map, dates);

        // 7. Click Handler
        map.on('click', function(e) {
            handleMapClick(e, map);
        });
        
        // 8. Layer Switch Handler
        map.on('overlayadd', function(e) {
            const layer = e.layer;
            console.log("Overlay added:", layer);
            
            setTimeout(() => {
                // If AFM Layer added
                if (isAFMLayer(layer)) {
                    console.log("Switching to AFM context");
                    removePKLayers(map);
                    
                    if (g_afm_dates && currentDates !== g_afm_dates) {
                        currentDates = g_afm_dates;
                        setupSlider(map, currentDates);
                        window.currentDate = currentDates[currentDates.length-1];
                        updateLayers(window.currentDate);
                    }
                }
                
                // If PK Layer added
                if (isPKLayer(layer)) {
                    console.log("Switching to PK context");
                    removeAFMLayers(map);
                    
                    if (g_pk_dates && currentDates !== g_pk_dates) {
                        currentDates = g_pk_dates;
                        setupSlider(map, currentDates);
                        window.currentDate = currentDates[currentDates.length-1];
                        updateLayers(window.currentDate);
                    }
                }
            }, 10);
        });

    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Error fetching AFM dates: ' + error.message);
    });
}

function isAFMLayer(layer) {
    return layer === g_tsdmlayer || layer === g_nbarlayer || layer === g_fclayer;
}

function removePKLayers(map) {
    if (g_pk_tsdmlayer && map.hasLayer(g_pk_tsdmlayer)) map.removeLayer(g_pk_tsdmlayer);
    if (g_pk_nbarlayer && map.hasLayer(g_pk_nbarlayer)) map.removeLayer(g_pk_nbarlayer);
    if (g_pk_fclayer && map.hasLayer(g_pk_fclayer)) map.removeLayer(g_pk_fclayer);
    if (g_pk_tsdmcompositlayer && map.hasLayer(g_pk_tsdmcompositlayer)) map.removeLayer(g_pk_tsdmcompositlayer);
    if (g_pk_nbarcompositlayer && map.hasLayer(g_pk_nbarcompositlayer)) map.removeLayer(g_pk_nbarcompositlayer);
    if (g_pk_fccompositlayer && map.hasLayer(g_pk_fccompositlayer)) map.removeLayer(g_pk_fccompositlayer);
}

function removeAFMLayers(map) {
    if (map.hasLayer(g_tsdmlayer)) map.removeLayer(g_tsdmlayer);
    if (map.hasLayer(g_nbarlayer)) map.removeLayer(g_nbarlayer);
    if (map.hasLayer(g_fclayer)) map.removeLayer(g_fclayer);
}

function isPKLayer(layer) {
    return layer === g_pk_tsdmlayer || layer === g_pk_nbarlayer || layer === g_pk_fclayer ||
           layer === g_pk_tsdmcompositlayer || layer === g_pk_nbarcompositlayer || layer === g_pk_fccompositlayer;
}

function setupSlider(map, dates) {
    if (slider) {
        map.removeControl(slider);
    }
    
    slider = L.control.slider(function(value) {
        const date = dates[value];
        window.currentDate = date;
        updateLayers(date);
        updateCoordDisplay(map);
    }, {
        'position': 'bottomleft',
        'max': dates.length - 1, 
        'value': dates.length - 1,
        'orientation': 'horizontal',
        'size': '300px',
        'collapsed': false,
        'syncSlider': true,
        'getValue': function(value){ return dates[value]; }
    });
    slider.addTo(map);
}

function updateLayers(date) {
    // AFM Layers
    if(g_tsdmlayer) g_tsdmlayer.setUrl(g_tileurl + '/tsdm/' + date + '/{z}/{x}/{y}');
    if(g_nbarlayer) g_nbarlayer.setUrl(g_tileurl + '/nbar/' + date + '/{z}/{x}/{y}');
    if(g_fclayer) g_fclayer.setUrl(g_tileurl + '/fractionalcover/' + date + '/{z}/{x}/{y}');
    
    // PK Layers
    if(currentPropertyId) {
        if(g_pk_tsdmlayer) g_pk_tsdmlayer.setUrl(g_pk_tileurl + '/tsdm/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
        if(g_pk_nbarlayer) g_pk_nbarlayer.setUrl(g_pk_tileurl + '/nbar/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
        if(g_pk_fclayer) g_pk_fclayer.setUrl(g_pk_tileurl + '/fractionalcover/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
        if(g_pk_tsdmcompositlayer) g_pk_tsdmcompositlayer.setUrl(g_pk_tileurl + '/tsdmcomposite/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
        if(g_pk_nbarcompositlayer) g_pk_nbarcompositlayer.setUrl(g_pk_tileurl + '/nbarcomposite/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
        if(g_pk_fccompositlayer) g_pk_fccompositlayer.setUrl(g_pk_tileurl + '/fractionalcovercomposite/' + date + '/' + currentPropertyId + '/{z}/{x}/{y}');
    }
}

function loadFarm(map, propertyId) {
    currentPropertyId = propertyId;
    console.log("Loading farm data...");
    
    fetch('/pk/dates/' + propertyId)
        .then(r => { if (!r.ok) throw new Error(`Dates API Error: ${r.status}`); return r.json(); })
        .then(data => {
            if (!data.dates || data.dates.length === 0) throw new Error("No dates found for this farm.");
            g_pk_dates = data.dates;
            
            currentDates = g_pk_dates;
            setupSlider(map, currentDates);
            window.currentDate = currentDates[currentDates.length-1];
            
            const startdate = g_pk_dates[0];
            const enddate = g_pk_dates[g_pk_dates.length-1];
            return fetch(`/pk/stats/${propertyId}?startdate=${startdate}&enddate=${enddate}`, { method: 'POST' });
        })
        .then(r => { if (!r.ok) throw new Error(`Stats API Error: ${r.status}`); return r.json(); })
        .then(data => {
            g_pk_stats = data;
            return fetch('/pk/geom/' + propertyId, { method: 'POST' });
        })
        .then(r => { if (!r.ok) throw new Error(`Geom API Error: ${r.status}`); return r.json(); })
        .then(data => {
            g_pk_geom = data;
            if (data && data.features) {
                const geoJsonLayer = L.geoJSON(data);
                map.fitBounds(geoJsonLayer.getBounds());
            }
            setupPKLayers(map, propertyId);
            console.log("Farm loaded successfully!");
        })
        .catch(error => {
            console.error("Error loading farm:", error);
            alert(`Failed to load farm: ${error.message}`);
        });
}

function setupPKLayers(map, propertyId) {
    const last_date = window.currentDate || '20250101';
    
    // TSDM
    if (!g_pk_tsdmlayer) {
        g_pk_tsdmlayer = L.tileLayer(g_pk_tileurl + '/tsdm/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_tsdmlayer, "TSDM (Farm)", "Pasture Key (Farm)");
    }
    
    // NBAR
    if (!g_pk_nbarlayer) {
        g_pk_nbarlayer = L.tileLayer(g_pk_tileurl + '/nbar/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_nbarlayer, "NBAR (Farm)", "Pasture Key (Farm)");
    }
    
    // FC
    if (!g_pk_fclayer) {
        g_pk_fclayer = L.tileLayer(g_pk_tileurl + '/fractionalcover/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_fclayer, "Fractional Cover (Farm)", "Pasture Key (Farm)");
    }
    
    // TSDM Composite
    if (!g_pk_tsdmcompositlayer) {
        g_pk_tsdmcompositlayer = L.tileLayer(g_pk_tileurl + '/tsdmcomposite/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_tsdmcompositlayer, "TSDM Composite (Farm)", "Pasture Key (Farm)");
    }
    
    // NBAR Composite
    if (!g_pk_nbarcompositlayer) {
        g_pk_nbarcompositlayer = L.tileLayer(g_pk_tileurl + '/nbarcomposite/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_nbarcompositlayer, "NBAR Composite (Farm)", "Pasture Key (Farm)");
    }
    
    // FC Composite
    if (!g_pk_fccompositlayer) {
        g_pk_fccompositlayer = L.tileLayer(g_pk_tileurl + '/fractionalcovercomposite/' + last_date + '/' + propertyId + '/{z}/{x}/{y}', {
            attribution: 'CiboLabs PK', maxZoom: 19
        });
        layerControl.addOverlay(g_pk_fccompositlayer, "FC Composite (Farm)", "Pasture Key (Farm)");
    }
    
    // Switch to PK TSDM (default)
    removePKLayers(map);
    map.addLayer(g_pk_tsdmlayer);
    
    // Hide AFM
    removeAFMLayers(map);
    
    // Ensure URLs are up to date
    updateLayers(window.currentDate);
}

function handleMapClick(e, map) {
    const zoom = map.getZoom();
    const point = map.project(e.latlng, zoom).divideBy(256).floor();
    const x = point.x;
    const y = point.y;
    const z = zoom;

    let activeLayer = null;
    let isPK = false;

    // Detect active layer
    if (map.hasLayer(g_tsdmlayer)) activeLayer = g_tsdmlayer;
    else if (map.hasLayer(g_nbarlayer)) activeLayer = g_nbarlayer;
    else if (map.hasLayer(g_fclayer)) activeLayer = g_fclayer;
    else if (isPKLayer(g_pk_tsdmlayer) && map.hasLayer(g_pk_tsdmlayer)) { activeLayer = g_pk_tsdmlayer; isPK = true; }
    else if (isPKLayer(g_pk_nbarlayer) && map.hasLayer(g_pk_nbarlayer)) { activeLayer = g_pk_nbarlayer; isPK = true; }
    else if (isPKLayer(g_pk_fclayer) && map.hasLayer(g_pk_fclayer)) { activeLayer = g_pk_fclayer; isPK = true; }
    else if (isPKLayer(g_pk_tsdmcompositlayer) && map.hasLayer(g_pk_tsdmcompositlayer)) { activeLayer = g_pk_tsdmcompositlayer; isPK = true; }
    else if (isPKLayer(g_pk_nbarcompositlayer) && map.hasLayer(g_pk_nbarcompositlayer)) { activeLayer = g_pk_nbarcompositlayer; isPK = true; }
    else if (isPKLayer(g_pk_fccompositlayer) && map.hasLayer(g_pk_fccompositlayer)) { activeLayer = g_pk_fccompositlayer; isPK = true; }

    if (!activeLayer) return;

    let url = activeLayer.getTileUrl({x:x, y:y, z:z});

    // Create Display URL (Original CiboLabs URL)
    let displayUrl = url;
    if (displayUrl.startsWith('/proxy/tiles/afm')) {
        displayUrl = displayUrl.replace('/proxy/tiles/afm', 'https://tiles.afm.cibolabs.com');
    } else if (displayUrl.startsWith('/proxy/tiles/pk')) {
        displayUrl = displayUrl.replace('/proxy/tiles/pk', 'https://tiles.pasturekey.cibolabs.com');
    }

    const popupDiv = document.createElement('div');
    popupDiv.style.width = '300px';
    popupDiv.style.textAlign = 'center';
    popupDiv.innerHTML = `
        <b>${isPK ? 'Pasture Key' : 'AFM'} Tile Info</b><br>
        Date: ${window.currentDate}<br>
        Z: ${z}, X: ${x}, Y: ${y}<br>
        <div style="word-break: break-all; font-size: 10px; margin: 5px 0; background: #f0f0f0; padding: 2px;">${displayUrl}</div>
        <div id="tile-image-container" style="min-height: 256px; display: flex; align-items: center; justify-content: center;">
            <img src="${url}" style="border: 1px solid #ccc; width: 256px; height: 256px; display: block;" onerror="this.style.display='none'; this.parentElement.innerText='Failed to load image';" />
        </div>
        <hr>
        <b>TSDM Time Series</b>
        <div id="tile-chart-container" style="height: 200px;">Loading Stats...</div>
    `;

    L.popup({minWidth: 320}).setLatLng(e.latlng).setContent(popupDiv).openOn(map);

    // Stats Logic
    const chartContainer = popupDiv.querySelector('#tile-chart-container');
    
    if (isPK) {
        if (!g_pk_geom || !g_pk_stats) { chartContainer.innerText = "Farm data not loaded yet."; return; }
        
        const pt = turf.point([e.latlng.lng, e.latlng.lat]);
        let foundFeature = null;
        if (g_pk_geom.features) {
            for (const feature of g_pk_geom.features) {
                try {
                    if (feature.geometry && turf.booleanPointInPolygon(pt, feature)) {
                        foundFeature = feature;
                        break;
                    }
                } catch (e) { console.warn("Turf error", e); }
            }
        }
        
        if (foundFeature) {
            const paddockId = foundFeature.properties.paddock_id;
            let paddockStats = null;
            if (g_pk_stats.paddocks) {
                const pItem = g_pk_stats.paddocks.find(p => p.paddock_id === paddockId);
                if (pItem && pItem.stats && pItem.stats.length > 0) paddockStats = pItem.stats[0];
            }
            if (paddockStats) renderChart(chartContainer, paddockStats);
            else chartContainer.innerText = "No stats for this paddock.";
        } else {
            chartContainer.innerText = "No paddock found at this location.";
        }

    } else {
        const geojson = tileToGeoJSON(x, y, z, map);
        const enddate = window.currentDate;
        const y_val = parseInt(enddate.substring(0, 4));
        const m_val = parseInt(enddate.substring(4, 6)) - 1;
        const d_val = parseInt(enddate.substring(6, 8));
        const dateObj = new Date(y_val, m_val, d_val);
        dateObj.setFullYear(dateObj.getFullYear() - 1);
        const sy = dateObj.getFullYear();
        const sm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const sd = dateObj.getDate().toString().padStart(2, '0');
        const startdate = `${sy}${sm}${sd}`;

        fetch(`/stats?startdate=${startdate}&enddate=${enddate}&percentiles=10,50,90`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geojson)
        })
        .then(r => r.json())
        .then(data => {
            if(!chartContainer) return;
            let stats = null;
            if (data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
                stats = data.features[0].properties.stats ? data.features[0].properties.stats[0] : null;
            } else if (data.type === 'Feature' && data.properties && data.properties.stats) {
                stats = data.properties.stats ? data.properties.stats[0] : null;
            }
            if (stats) renderChart(chartContainer, stats);
            else chartContainer.innerText = "No stats data available.";
        })
        .catch(err => {
            if(chartContainer) chartContainer.innerText = `Error: ${err.message}`;
        });
    }
}

// Helper functions
function tileToGeoJSON(x, y, z, map) {
    const nwPoint = new L.Point(x * 256, y * 256);
    const sePoint = new L.Point((x + 1) * 256, (y + 1) * 256);
    const nw = map.unproject(nwPoint, z);
    const se = map.unproject(sePoint, z);
    const coordinates = [[
        [nw.lng, nw.lat], [nw.lng, se.lat], [se.lng, se.lat], [se.lng, nw.lat], [nw.lng, nw.lat]
    ]];
    return { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": coordinates } };
}

function renderChart(container, stats) {
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    const labels = stats.dates.map(d => `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`);
    
    const datasets = [];
    if (stats.p10) datasets.push({ label: 'P10', data: stats.p10, borderColor: 'transparent', pointRadius: 0, fill: false, order: 2 });
    if (stats.p90) datasets.push({ label: 'Range', data: stats.p90, borderColor: 'transparent', backgroundColor: 'rgba(100, 149, 237, 0.3)', pointRadius: 0, fill: '-1', order: 2 });
    if (stats.mean) datasets.push({ label: 'Mean', data: stats.mean, borderColor: 'blue', borderWidth: 2, pointRadius: 0, fill: false, order: 1 });
    if (stats.median || stats.p50) datasets.push({ label: 'Median', data: stats.median || stats.p50, borderColor: 'green', borderWidth: 2, pointRadius: 0, fill: false, order: 1 });

    new Chart(canvas, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'month' } }, y: { title: { display: true, text: 'TSDM (kg/ha)' } } }, plugins: { legend: { display: true, labels: { boxWidth: 10 } } } }
    });
}