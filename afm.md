# AFM API

## Endpoints

See our [online AFM API docs](https://data.afm.cibolabs.com/swagger) for 
the list of endpoints.

## Examples

These examples use the curl program in a linux terminal
to send requests to the API. They assume:
- you have curl installed
- you have exchanged your credentials for an access token
  (see the [Quick start](quickstart.md) for how to do this).
  The access token is stored in the `TOKEN` variable

### /getimagedates 

**Request**

https://data.afm.cibolabs.com/getimagedates 

```bash
curl -s -X POST \ 
    --output data.json \ 
    -H "Content-Type: application/json" \ 
    -H "Authorization: Bearer ${TOKEN}" \ 
    "https://data.afm.cibolabs.com/getimagedates
```

**Response** 

```json
{ 
    dates: ["20170105", "20170110", ...] 
}
```

### /gettsdmstats with a single Feature

In this example, the geojson is supplied in the request's body.
The geojson contains a single Feature.

**Request**

```bash
geojson_file="your_area_of_interest.geojson" 
geojson=$(cat "$geojson_file") 
startdate="20240101" 
enddate="20251231" 
percentiles="5,95"
 
curl -s -X POST \ 
    --output data.json \ 
    -H "Content-Type: application/json" \ 
    -H "Authorization: Bearer ${TOKEN}" \ 
    -d "$geojson" \ 
    "https://data.afm.cibolabs.com/gettsdmstats?startdate=$startdate&enddate=$enddate&percentiles=$percentiles" 
```

 
**Body**

```json
{ 
  "type": "Feature", 
  "properties": { 
    "name": "feature_a, 
  }, 
  "geometry": { 
    "type": "Polygon", 
    "coordinates": [ 
      ... 
    ] 
  } 
}
```

**Response** 

Notes: 
- attributes on input features are returned unchanged 
- geometry is returned unchanged 
- stats are inserted in the stats list
- captured is the percentage of the geometry’s area that is unaffected by 
  cloud or water and within the territory’s extent
- area is the geometry’s area in hectares 

 
```json
{ 
      "type": "Feature", 
      "properties": { 
        "name": "feature_a", 
        "stats": [ 
          { 
            "measure": "tsdm", 
            "unit": "kg/ha", 
            "dates": ["20250101", "20250106", ...], 
            "captured": [100, 100, ...], 
            "median": [2612, 2631, ...], 
            "mean": [2453, 2489, ...], 
            "std": [876, 891, ...], 
            "p5": [301, 312, ...], 
            "p10": [354, 362, ...], 
            "p25": [1987, 1999, ...], 
            "p75": [3001, 3053, ...], 
            "p90": [3122, 3150, ...], 
            "p95": [3182, 3198, ...], 
            "area": 765.90 
          }  
        ] 
      }, 
      "geometry": { 
        "type": "Polygon", 
        "coordinates": [ 
        ... 
       ] 
    } 
```

### /gettsdmstats with a FeatureCollection

If the input geojson is a FeatureCollection with multiple Features,
the API aggregates all geometries together and computes one set
of statistics. 

If you want statistics for single feature, you must call the API multiple times, passing just a single feature. 

**Request**

https://data.afm.cibolabs.com/gettsdmstats?enddate=20250430&startdate=20250101&percentiles=5,95&aggregate=true 


**Body** 

```json
{ 
  "type": "FeatureCollection", 
  "features": [ 
    { 
      "type": "Feature", 
      "properties": { 
        "name": "feature_a" 
      }, 
      "geometry": { 
        "type": "Polygon", 
        "coordinates": [ 
        ... 
       ] 
    }, 
    { 
      "type": "Feature", 
      "properties": { 
        "name": "feature_b", 
      }, 
      "geometry": { 
        "type": "Polygon", 
        "coordinates": [ 
        ... 
       ] 
    } 
  ] 
} 
```

**Response**

Notes:
- The stats returned in each feature are identical,
  and represent the aggregate stats, so you only need to read
  the stats from the first feature
- The response also includes the ‘aggregate’: ‘yes’ property 
- captured is the percentage of the aggregated’ geometry’s area that
  is unaffected by cloud or water and within the territory’s extent
- area is the area of the aggregated geometries in hectares 

```json
{ 
  "type": "FeatureCollection", 
  "features": [ 
    { 
      "type": "Feature", 
      "properties": { 
        "name": "feature_a", 
        "aggregate": "yes" 
        "stats": [ 
          { 
            "measure": "tsdm", 
            "unit": "kg/ha", 
            "dates": ["20250101", "20250106", ...], 
            "captured": [100, 98, ...], 
            "median": [2612, 2631, ...], 
            "mean": [2453, 2489, ...], 
            "std": [876, 891, ...], 
            "p5": [301, 312, ...], 
            "p10": [354, 362, ...], 
            "p25": [1987, 1999, ...], 
            "p75": [3001, 3053, ...], 
            "p90": [3122, 3150, ...], 
            "p95": [3182, 3198, ...], 
            "area": 3832.76 
          }  
        ] 
      }, 
      "geometry": { 
        "type": "MultiPolygon", 
        "coordinates": [ 
        ... 
       ] 
    }, 
    "type": "Feature", 
      "properties": { 
        "name": "feature_b", 
        "aggregate": "yes" 
        "stats": [ 
          { 
            "measure": "tsdm", 
            "unit": "kg/ha", 
            "dates": ["20250101", "20250106", ...], 
            "captured": [100, 98, ...], 
            "median": [2612, 2631, ...], 
            "mean": [2453, 2489, ...], 
            "std": [876, 891, ...], 
            "p5": [301, 312, ...], 
            "p10": [354, 362, ...], 
            "p25": [1987, 1999, ...], 
            "p75": [3001, 3053, ...], 
            "p90": [3122, 3150, ...], 
            "p95": [3182, 3198, ...], 
            "area": 3832.76 
          }  
        ] 
      }, 
      "geometry": { 
        "type": "MultiPolygon", 
        "coordinates": [ 
          ... 
       ] 
    } 
  ] 
}
```
