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

### /getpaddockinfo

Get basic information about the farm's paddocks.

**Request**

GET https://data.pasturekey.cibolabs.com/getpaddockinfo/e354f641-fce2-4299-a7d4-561dc31597d2

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"

curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/getpaddockinfo/${farmid}"
```

**Response**

```json
{
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "paddocks": [
    {
      "paddock_id": "02c50970-308e-4f26-9841-0df5899f3daa",
      "area_ha": 150,
    },
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "area_ha": 326,
    },
    ...
  ]
}
```

### /getpaddocktsdmts

> ⚠️ Deprecated and replaced with /gettsdmstats.

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
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "paddocks": [
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "paddock_name": "charlies lane",
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
          "captured": [100, 89, ...],
          "captured_median": [1301, 1143, ...],
          "captured_foo": [424126, 412345, ...]
        }
      ]
    },
    {
      "paddock_id": "02c50970-308e-4f26-9841-0df5899f3daa",
      "area_ha": 150,
      ...
    }
  ]
}
```

Notes:
- dates are the dates of the satellite overpasses
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


### /geojson

> ⚠️ Deprecated and replaced with /snapshot.

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
        "paddock_name": "charlies lane",
        "area_ha": 326,
        "stats": [
          {
            "measure": "tsdm",
            "unit": "kg/ha",
            "dates": ["20250210"],
            "median": [1223],
            "median_error": [202],
            "foo": [398698],
            "change_rate": [-10],
            "trend": "Decreasing",
            "captured": [100],
            "captured_median": [1109],
            "captured_foo": [361534]
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


### /geom

Get the most recent paddock geometries for the farm, attributed with the Cibolabs paddock IDs.

**Request**

POST https://data.pkey.cibolabs.com/geom/e354f641-fce2-4299-a7d4-561dc31597d2

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pkey.cibolabs.com/geom/${farmid}"
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
        "paddock_name": "charlies lane",
        "area_ha": 37.11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          ...
        ]
      }
    },
    ...
  ]
}
```


### /downloaddata

Submit a request to create geotiffs for the farm's imagery on
the specified date. The geotiffs are added to a zip file.
This is an asynchronous operation.
The response contains a URL to the zip file.
However, depending on the amount of the data requested,
it will take several minutes for the zip file to be retrievable
using the URL. The client must poll the URL and download the file
when available. Anyone with the link can access the file.
Note the expiry time in the URL.

**Request**

GET https://data-uat.pasturekey.cibolabs.com/downloaddata/20250521/e354f641-fce2-4299-a7d4-561dc31597d2?product=nbar&product=tsdm 

```bash
imagedate="20250210"
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
product1="nbar"
product2="tsdm"

curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/downloaddata/${imagedate}/${farmid}?product=${product1}&product=${product2}"
```

Use these product names to request image products at the specified date: 
  - nbar (the satellite image: normalised and BRDF-adjusted reflectance)
  - tsdm (Total Standing Dry Matter / pasture biomass)
  - tsdmgreen (green Total Standing Dry Matter)
  - tsdmdead (dead Total Standing Dry Matter)
  - fc (fractional cover: the percentage of bare, green and dead cover)
  - totalcover (the percentage of total cover = 100 - bare cover)
  - greencover (the percentage of green cover)

If the capture at the specified date is cloudy, a 30-day composite
may provide a better view of the farm. Use these product names to
request a median, 30-day composites of the products,
created from all image captures in the 30 days prior to the specified date:
  - nbarcomp
  - tsdmcomp
  - tsdmgreencomp
  - tsdmdeadcomp
  - fccomp
  - totalcovercomp
  - greencovercomp

A TSDM change image is available with this product name. It is the 
difference between the TSDM composite image at the specified date
and one 30 days prior:
  - tsdmchange


**Response**

```json
{ 
  "message":"complete", 
  "orderid":894, 
  "url":"https://pkey-download-batch-dev-outbucket.s3.amazonaws.com/pkey_order_e354f641-fce2-4299-a7d4-561dc31597d2-20250521_00_o894.zip?AWSAccessKeyId=AKIAUZPNLACPXMIVFZFE&Signature=qkHKxuOKLXsYFsKicJ%2FsFpY0LIE%3D&Expires=1748588254" 
} 
```

**Retrieve the file**

Make a download request using your tool of choice. Here we use wget. 

```bash
wget -O order_894.zip "https://pkey-download-batch-dev-outbucket.s3.amazonaws.com/pkey_order_e354f641-fce2-4299-a7d4-561dc31597d2-20250521_00_o894.zip?AWSAccessKeyId=AKIAUZPNLACPXMIVFZFE&Signature=qkHKxuOKLXsYFsKicJ%2FsFpY0LIE%3D&Expires=1748588254"
```

The server responds with http status code `404` until the backend processing
creates and makes the file available.

```bash
Resolving pkey-download-batch-dev-outbucket.s3.amazonaws.com (pkey-download-batch-dev-outbucket.s3.amazonaws.com)... 52.218.133.145, 52.92.250.73, 52.218.250.131, ... Connecting to pkey-download-batch-dev-outbucket.s3.amazonaws.com (pkey-download-batch-dev-outbucket.s3.amazonaws.com)|52.218.133.145|:443... connected. HTTP request sent, awaiting response... 404 Not Found 2025-05-29 06:45:22 ERROR 404: Not Found.
```

The server responds with http status code `200` when the file is available 

```bash
Resolving pkey-download-batch-dev-outbucket.s3.amazonaws.com (pkey-download-batch-dev-outbucket.s3.amazonaws.com)... 52.92.233.9, 52.92.241.209, 52.92.229.145, ... 
Connecting to pkey-download-batch-dev-outbucket.s3.amazonaws.com (pkey-download-batch-dev-outbucket.s3.amazonaws.com)|52.92.233.9|:443... connected. 
HTTP request sent, awaiting response... 200 OK 
Length: 1183718 (1.1M) [binary/octet-stream] 
Saving to: ‘order_894.zip’ 
order_894.zip                 100%[===============================================>]   1.13M  --.-KB/s    in 0.007s
2025-05-29 06:47:37 (161 MB/s) - ‘order_894.zip’ saved [1183718/1183718]
```

## Chaining

You can chain multiple calls to the PastureKey API endpoints together, in sequence.
When chaining, pass the returned json from one request as the body of the next request.
The result of `/getpaddockinfo` and `/gettsdmstats` can be passed into the `/geom` endpoint to attach 
geometry.
The result of `/gettsdmstats` can be passed back into `/gettsdmstats` to attach statistics
for further paddocks.

### Chaining example

In this example, we chain 2 calls together:

- /gettsdmstats
- /geom

/gettsdmstats takes a property_id and optional start/end dates and returns
a JSON object with a list of paddocks and their statistics.

We then pass what is returned into the /geom endpoint to attach some
geometry and turn this into geojson.

Summary of requests:

```
POST https://data.pasturekey.cibolabs.com/gettsdmstats/340dec85-ac4b-422d-beec-a7304b596fb3

POST https://data.pasturekey.cibolabs.com/geom/340dec85-ac4b-422d-beec-a7304b596fb3
```

In detail:

```
property_id=340dec85-ac4b-422d-beec-a7304b596fb3

# First call to /gettsdmstats
curl -s -X POST -o output_1.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
     https://data.pasturekey.cibolabs.com/gettsdmstats/${property_id}     
     
curl -s -X POST -o output_2.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d @output_1.json \
    https://data.pasturekey.cibolabs.com/geom/${property_id}

```

The final output, output_2.json, contains geojson with the geometry for the paddocks, but also the
statistics from /gettsdmstats which were generated by the first call:

```json
{
  "type": "FeatureCollection",
  "property_id": "340dec85-ac4b-422d-beec-a7304b596fb3",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "paddock_id": "82dc9b7f-3ba5-42eb-b517-842798975385",
        "paddock_name": "unknown",
        "area_ha": 10.3534,
        "stats": [
          {
            "measure": "tsdm",
            "unit": "kg/ha",
            "dates": [
              "20250521",
              "20250523",
              "20250525",
              ....
            "median": [
              1906,
              2165,
              1798,
              .....
            "median_error": [
              723,
              761,
              948,
              .....
            "foo": [
              19733.492084705696,
              22415.010683834123,
              18615.32988893014,
              ....
            "change_rate": [
              119.125,
              192.42857142857142,
              108.88888888888889,
              ...
            "captured": [
              78,
              100,
              0,
              ....
            "captured_median": [
              3969.0,
              2401.0,
              0,
              ....
            "captured_foo": [
              41092.46069475179,
              24858.40214867701,
              0.0,
              .....
            ]
          }
        ]
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                148.96123,
                -32.977412
              ],
              [
                148.965993,
                -32.978096
              ],
              [
                148.965693,
                -32.980094
              ],
              [
                148.960822,
                -32.979464
              ],
              [
                148.96123,
                -32.977412
              ]
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "paddock_id": "886d830f-c686-4bbf-8bb0-3e7c7668b9e9",
        "paddock_name": "unknown",
        "area_ha": 13.2727,
        "stats": [
          {
            "measure": "tsdm",
            "unit": "kg/ha",
            "dates": [
              "20250521",
              "20250523",
              "20250525",
            .....
            }]
          }
        ]
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
          ....
          ]
        ]
      }
    }
  ]
}

```

### Valid chaining sequences

The following chain of calls is supported:

- passing the result of /gettsdmstats back to /gettsdmstats
- passing the result of /gettsdmstats to /geom
- passing the result of /getpaddockinfo to /geom

## Handling special cases

### Handling the response time-out limit of 30 seconds

The API has a time-out period of 30 seconds. You may need to shorten the
time-period (`startdate` and `enddate` parametersof /gettsdmstats) of your request, and
make multiple calls to the API.

If you wish, you may chain the requests with different start and end dates.
A new stats object for the second request is appended to the stats
list of the Feature's properties.

For example. Your first request to `/gettsdmstats` is for the year 2023
(`startdate=20230101&enddate=20231231`). The response is chained with a 
second request to `gettdsmstats` for the year 2024
(`startdate=20240101&enddate=20241231`). The output contains two stats objects
in the stats list, one for each year.

```json
{
 "property_id": "340dec85-ac4b-422d-beec-a7304b596fb3",
  "paddocks": [
    {
      "paddock_id": "82dc9b7f-3ba5-42eb-b517-842798975385",
      "paddock_name": "unknown",
      "stats": [
        {
          "measure": "tsdm",
          "unit": "kg/ha",
          "dates": [
            "20230103",
            ....
          ]
          ....
        }
      },
      {
          "measure": "tsdm",
          "unit": "kg/ha",
          "dates": [
            "20240102",
            ...
          ]
          ....
      }
    }
  ]
}
```

### Handling the request and response size limit of 6 MB

The maximum size of a request's body or the response is 6MB.
This cannot be increased. You must restructure your requests if
you hit this limit.
