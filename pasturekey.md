# Pasture Key API

## Endpoints

See our
[online Pasture Key API docs](https://data.pasturekey.cibolabs.com/swagger)
for the list of endpoints.

## Examples

These examples use the curl program in a linux terminal
to send requests to the API. They assume:
- you have curl installed
- you have exchanged your credentials for an access token
  (see the [Quick start](quickstart.md) for how to do this).
  The access token is stored in the `TOKEN` variable

### /getimagedates

**Request**

GET https://data.pasturekey.cibolabs.com/getimagedates/e354f641-fce2-4299-a7d4-561dc31597d2

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"

curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/getimagedates/${farmid}"
```

**Response**

```json
{
  "dates": [
    "20250101",
    "20250106",
    "20250111",
    "20250116",
    "20250121",
    "20250131",
    "20250210"
  ]
}
```

### /getpaddocktsdmts

> ⚠️ Upcoming deprecation warning: To be deprecated and replaced with /gettsdmstats.

**Request**

POST https://data.pasturekey.cibolabs.com/getpaddocktsdmts/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20250101&enddate=20250210

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
startdate="20250101"
enddate="20250210"

curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/getpaddocktsdmts/${farmid}?startdate=${startdate}&enddate=${enddate}"
```


**Response**

```json
{
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "measure": "tsdm",
  "unit": "kg/ha",
  "paddocks": [
    {
      "paddock_id": "02c50970-308e-4f26-9841-0df5899f3daa",
      "dates": [
        "2025-01-01",
        "2025-01-06",
        "2025-01-11",
        ...
      ],
      "estimated": [
        1946,
        null,
        1721,
        ...
      ],
      "estimated_error": [
        146,
        null,
        362,
        ...
      ],
      "median": [
        1681,
        null,
        1521,
        ...
      ]
    },
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "dates": [
        "2025-01-01",
        "2025-01-06",
        "2025-01-11",
        ...
      ],
      ...
    }
  ]
}
```


### /gettsdmstats

> ⚠️ Important: Not implemented yet. Earmarked to replace /getpaddocktsdmts.

Get paddock statistics for pasture biomass measured as
Total Standing Dry Matter (TSDM).

**Request**

POST https://data.pasturekey.cibolabs.com/gettsdmstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20250501&enddate=20250525

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
startdate="20250501"
enddate="20250525"
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/gettsdmstats/${farmid}?startdate=${startdate}&enddate=${enddate}"
```

**Reponse**

```json
{
  "type": "FeatureCollection",
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
        "area_ha": 326,
        "stats": [
          {
              "measure": "tsdm",
              "unit": "kg/ha",
              "dates": ["20250501", "20250506", ...],
              "median": [1223, 1212, ...],
              "median_error": [202, 197, ...],
              "foo": [398698, 389123, ...],
              "change_rate": [-10, -12, ...],
              "trend": "Decreasing",
              "captured": [100, 89, ...],
              "captured_median": [1301, 1143, ...],
              "captured_foo": [424126, 412345, ...]
          }
        ]
      }
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          ...
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "paddock_id": "02c50970-308e-4f26-9841-0df5899f3daa",
        "area_ha": 150,
        "stats": [
          {
              "measure": "tsdm",
              "unit": "kg/ha",
              "dates": ["20250501", "20250506", ...],
              "captured": [100, 95, ...],
              "median": [1681, 1700, ...],
              "median_error": [146, 150, ...],
              "foo": [252150, 255000, ...],
              "change_rate": [null, 19, ...],
              "trend": "Steady"
          }
        ]
      }
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          ...
        ]
      }
    }
  ]
}
```

Notes:
- The properties object of every feature (paddock) contains a list
  of stats objects, one for each ‘measure’ (in this case only one measure)
- captured is the percentage of the paddock captured in the satellite
  image; this is less than 100 when:
  - cloud or cloud shadow obscures the satellite’s view of the ground
  - part of the paddock is outside the satellite image’s extents
- median is the estimated median TSDM in kg/ha for the paddock;
  it’s calculated by smoothing several observations,
  which reduces the noise created by partial captures and
  variation in atmospheric conditions at capture time
- median_error is the expected variation in the median estimate
- Foo (feed on offer) in kg, calculated as the median * area_ha 
- change rate is measured in kg / ha / day
- a description of the trend is provided


### /geojson

> ⚠️ Upcoming deprecation warning: To be deprecated and replaced with /snapshot.

Get a map (geojson) of the farm, attributed with key statistics
for the requested date.
Returns data for the date closest to the requested date for which
data are available.

**Request** 

GET https://data.pasturekey.cibolabs.com/geojson/20250210/e354f641-fce2-4299-a7d4-561dc31597d2 

```bash
imagedate="20250210"
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"

curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/geojson/${imagedate}/${farmid}"
```

**Response**

```json
{
  "type": "FeatureCollection",
  "name": "e354f641-fce2-4299-a7d4-561dc31597d2_20250210",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "centroid": "149.81772,-26.76692",
        "property_name": "e354f641-fce2-4299-a7d4-561dc31597d2",
        "paddock_name": "charlies lane",
        "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
        "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
        "paddock_area_ha": 37.11,
        "capture_date": "20250210",
        "percent_captured": 100,
        "estimated_median_tsdm": 1242,
        "estimated_median_tsdm_error": 114,
        "estimated_foo": 46090,
        "estimated_tsdm_change_rate": -10,
        "trend": "Decreasing",
        "raw_median_tsdm": 1225,
        "raw_foo": 45459
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [ ... ]
      }
    },
    ...
  ],
  "legend": {
    "title": "Biomass (kg/ha)",
    "legend": [
      {
        "label": "<=250",
        "color": [215, 25, 28]
      },
      ...
    ]
  }
}
```

Notes:

- capture_date is the date of the satellite overpass 
- percent_captured is the percent of the paddock captured in the satellite image; this is less than 100 when:
  - cloud or cloud shadow obscures the satellite’s view of the ground
  - part of the paddock is outside the satellite image’s extents 
- estimated_median_tsdm is our best estimate for Total Standing Dry Matter
 in kg/ha; it’s a weighted smoothing of several raw_median_tsdm values,
 to reduce the influence of captures with percent_captured < 100 and
 adverse atmospheric conditions that cause noisy TSDM estimates on any
 given capture date
- estimated_foo is the feed on offer in the paddock in ha,
  calculated as estimated_median_tsdm x paddock_area_ha
- estimated_tsdm_change_rate is the rate of change of tsdm in kg/ha/day
  on the capture_date 
- raw_median_tsdm is the Total Standing Dry Matter in kg/ha as seen by
  the satellite on the capture_date
- Legend is a colour table; it can be used to style returned geojson if
  you wish by linking it with the estimated_median_tsdm field
  (the legend attribute is a geojson foreign member:
  https://www.rfc-editor.org/rfc/rfc7946#section-6.1) 


### /snapshot

> ⚠️ Important: Not implemented yet. Earmarked to replace /geojson

Get a snapshot of the farm’s paddocks as a geojson file,
attributed with key statistics for the requested date.
Returns data for the date closest to the requested date for which
data are available.

**Request**

GET https://data.pasturekey.cibolabs.com/snapshot/20250210/e354f641-fce2-4299-a7d4-561dc31597d2

```bash
imagedate="20250210"
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/snapshot/${imagedate}/${farmid}"
```

**Response**

```json
{
  "type": "FeatureCollection",
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
        "area_ha": 326,
        "stats": [
          {
            "measure": "tsdm",
            "unit": "kg/ha",
            "dates": ["20250210"],
            "captured": [100],
            "median": [1223],
            "median_error": [202],
            "foo": [398698],
            "change_rate": [-10],
            "trend": "Decreasing",
          }
        ]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          ...
        ]
      }
    },
    {
      ...
      ...
    }
  ],

  "legend": {
    "title": "Biomass (kg/ha)",
    "legend": [
      {
        "label": "<=250",
        "color": [
          215,
          25,
          28
        ]
      },
      ...
    ]
  }
}
```

Notes:
- See also the notes for /gettsdmstats 
- Legend is a colour table; it can be used to style returned geojson if
  you wish by linking it with the estimated_median_tsdm field
  (the legend attribute is a geojson foreign member:
  https://www.rfc-editor.org/rfc/rfc7946#section-6.1)
