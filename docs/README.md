# Demo Pasturekey web application

This folder contains a **pasture monitoring web application**
built with leaflet.js.

The application shows you how to call the Pasturekey API and
the Pasturekey Tile API. It demonstrates how to display the imagery
and farm boundary information on a web map. It creates a time series
chart of TSDM (Total Standing Dry Matter), display data for all paddock.

An access token is required to use the application.
See the [Quickstart](../quickstart.md) for instructions on
obtaining a set of credentials from us, and using them
to create an access token.

View the application at https://cibolabs.github.io/api-docs/

[index.js](static/js/index.js) is where the API calls are made.
The API requires a property ID. The demo app uses the property ID
of our demo farm.

## Core Functionality

**Authentication & Property Setup**
- Displays a modal dialog requiring an API token and property ID for access
- Authenticates with the CiboLabs PastureKey API to access farm-specific data

**Interactive Satellite Imagery Map**
- Creates a zoomable map centered on an Australian farm
  location (-31.349°, 150.134°)
- Displays two types of satellite imagery layers:
  - **TSDM** (Total Standing Dry Matter) - shows biomass/vegetation density
  - **NBAR** (Nadir BRDF Adjusted Reflectance) - shows surface reflectance data
- The NBAR layer is shown by default

**Property Boundaries**
- Fetches and displays farm paddock boundaries as GeoJSON overlays
- Shows the exact extent of the property being monitored

**Time Series Navigation**
- **Date Slider**: Horizontal slider control allowing users to
  navigate through satellite images acquired on different dates
- Updates both TSDM and NBAR imagery as the slider moves
- Creates a time-lapse effect to see vegetation changes over time

**Layer Controls**
- Grouped layer control with:
  - **CiboLabs group**: TSDM and NBAR (only one can be active)
  - **Other group**: Property boundaries (can be toggled independently)
  - OpenStreetMap base layer

**TSDM Analytics Chart**
- Fetches TSDM for all paddocks on the property
- Creates a Chart.js line chart showing TSDM values over time for each paddock
- The Chart appears only after data loads

## Technical Architecture

**APIs Used:**
- `tiles.pasturekey.cibolabs.com` - Satellite imagery tiles
- `data.pasturekey.cibolabs.com` - Statistics and geometry data

**Libraries:**
- **Leaflet.js** - Main mapping library
- **Custom Leaflet plugins** - Headers, grouped layer control, slider
- **Chart.js** - Time series visualization

**Data Flow:**
1. User authentication → 2. Map initialization → 3. Fetch available dates → 4. Load initial imagery → 5. Add property boundaries → 6. Create interactive controls → 7. Generate analytics chart

This is essentially a **farm monitoring dashboard** that combines satellite imagery with statistical analysis to help users track pasture conditions and vegetation health over time.

## Running the application locally

```
git clone https://github.com/cibolabs/api-docs.git
cd docs
python3 -m http.server
```

Then in a browser, navigate to
[http://localhost:8000/](http://localhost:8000/).
Changes to your code are reloaded when you refresh.
