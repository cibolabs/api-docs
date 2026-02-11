# Pasture Key API

## Endpoints

See our
[online Pasture Key API docs](https://data.pasturekey.cibolabs.com/swagger)
for the list of endpoints.

## Introduction

The Pasture Key API supports two Pasture Key related services:

1. Pasture Key properties
2. Pasture Key Devices

### Pasture Key properties

A Pasture Key property is associated with one or more paddocks.
Users create their property and map their paddocks using the
Cibolabs application (the frontend).

The backend processes satellite imagery for the property's paddocks.

A property's data is retrieved using the pasturekey API endpoints,
specifying the property ID and optional paddock IDs. See the examples below.

### Pasture Key devices

A Pasture Key device is associated with one or more areas of interest (AOI).
A device and its AOIs are created (and deleted) using the device endpoints.
See the examples below.

After AOIs have been added, the backend processes the imagery.
There will be a delay before the data is available to be queried.

A device's data is retrieved using the pasture key endpoints.
When using these endpoints for a device, specify the device ID
(instead of the property ID) and optional AOI IDs (instead of paddock IDs).

## Most recent changes

Date | Change | endpoints
---- | ------ | --------
2026-02-11 | Bug fix: /snapshot now correctly returns nearest, prior date when data not available for given date | /snapshot
2026-02-09 | Added the change_rate attribute to response of several endpoints | /snapshot, /gettsdmgreenstats, /gettsdmdeadstats, /getfcstats
2026-02-06 | Added tsdmgreen, tsdmdead, and fc stats to response of /snapshot endpoint | /snapshot
2026-02-04 | Added /getfcstats endpoint | /getfcstats
2026-01-30 | Added /gettsdmgreenstats and /gettsdmdeadstats endpoints | /gettsdmgreenstats, /gettsdmdeadstats


## Examples

These examples use the curl program in a linux terminal
to send requests to the API. They assume:
- you have curl installed
- you have exchanged your credentials for an access token
  (see the [Quick start](quickstart.md) for how to do this).
  The access token is stored in the `TOKEN` variable


### Metadata endpoints

#### /getimagedates

Get a list of dates for the satellite overpasses.

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

#### /getpaddockinfo

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

### Geometry endpoints

These endpoints return geojson with the geometry for the paddocks.

#### /geom

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

#### /snapshot

Get a snapshot of the farm’s paddocks as a geojson file,
attributed with key statistics for the requested date.

If no data exists for the requested date,
the most recent prior date within 10 days is used.


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
          },
          {
            "measure": "tsdmgreen",
            "unit": "kg/ha",
            "dates": ["20250210"],
            "median": [353],
            "foo": [13099.818952289808],
            "change_rate": [-5],
            "trend": "Decreasing",
            "captured": [86]
          },
          ...
          {
            "measure": "fcgreen",
            "unit": "%",
            "captured": [0],
            "dates": ["20251231"],
            "median": [49],
            "change_rate": [0.2857142857142857],
            "trend": "Steady"
          },
           ...
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

If no satellite overpass is found for the specified date or within
10 days prior, the stats object contains empty lists.
For example:

```json
"stats": [
  {
    "measure": "tsdm",
    "unit": "kg/ha",
    "dates": [],
    "median": [],
    "median_error": [],
    "foo": [],
    "change_rate": [],
    "captured": [],
    "captured_median": [],
    "captured_foo": []
  },
  ...
]
```

If there is a satellite overpass, but we weren't able to make an estimate
(due to cloud, for example), the stats object contains null values. For example:

```json
"stats": [
  {
    "measure": "tsdm",
    "unit": "kg/ha",
    "dates": ["20251227"],
    "median": [null],
    "foo": [null],
    "change_rate": [null],
    "captured": [0],
    "trend": null
  },
  ...
]
```

Notes:
- Legend is a colour table; it can be used to style returned geojson if
  you wish by linking it with the estimated_median_tsdm field
  (the legend attribute is a geojson foreign member:
  https://www.rfc-editor.org/rfc/rfc7946#section-6.1)


See also:
- /gettsdmstats
- /gettsdmgreenstats
- /gettsdmdeadstats
- /getfcstats



### Statistics endpoints

#### /gettsdmstats

Get paddock statistics for pasture biomass measured as
Total Standing Dry Matter (TSDM).

See also:
- /gettsdmgreenstats
- /gettsdmdeadstats

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
- captured_median is the median TSDM in kg/ha for the captured portion;
  this value can be highly-variable between dates; it's highly recommended that
  you use the median field for any application that needs a stable TSDM estimate
- captured_foo is the feed on offer in kg for the captured portion,
  calculated as captured_median * area_ha; like captured_median, this value
  can be highly variable between dates
- this is the only endpoint for which we provide an esimate of error and
  captured_median and captured_foo


#### /gettsdmgreenstats

Get paddock statistics for green pasture biomass measured as that component of
Total Standing Dry Matter (TSDM) attributed to green vegetation.

See also:
- /gettsdmstats
- /gettsdmdeadstats

**Request**

POST https://data.pasturekey.cibolabs.com/gettsdmgreenstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20251001&enddate=20251031

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
startdate="20251001"
enddate="20251031"
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/gettsdmgreenstats/${farmid}?startdate=${startdate}&enddate=${enddate}"
```

**Response**


```json
{
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "paddocks": [
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "area_ha": 37.10996870337056,
      "paddock_name": "unknown",
      "stats": [
        {
          "measure": "tsdmgreen",
          "unit": "kg/ha",
          "dates": ["20251003", "20251008", ...],
          "median": [1094, 1053, ...],
          "change_rate": [-52, -41, ...],
          "foo": [40598.3057614874, 39076.7970446492, ...],
          "captured": [100, 92, ...]
        }
      ]
    },
    {
      "paddock_id": "b6ad9142-b6b9-4c54-98f7-08a9631961cb",
      "area_ha": 0.012428353981807513,
      ...
    }
  ]
}
```

Notes:
- change_rate is measured in `kg/ha/day`

See also:
- /gettsdmstats


#### /gettsdmdeadstats

Get paddock statistics for dead pasture biomass measured as that component of
Total Standing Dry Matter (TSDM) attributed to dead vegetation.

Refer to /gettsdmgreenstats.

See also:
- /gettsdmstats


#### /getfcstats

Get fractional cover (FC) statistics for paddocks.
Fractional cover is the percentage of the paddock covered by green vegetation,
dead vegetation and bare ground.

**Request**

POST https://data.pasturekey.cibolabs.com/getfcstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20251001&enddate=20251031

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"
startdate="20251001"
enddate="20251031"
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/getfcstats/${farmid}?startdate=${startdate}&enddate=${enddate}"
```

**Response**

```json
{
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "paddocks": [
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "area_ha": 37.10996870337056,
      "paddock_name": "unknown",
      "stats": [
        {
          "measure": "fcgreen",
          "unit": "%",
          "dates": ["20251003", "20251008", ...],
          "median": [20, 17, ...],
          "change_rate": [-2, -3, ...],
          "captured": [100, 92, ...]
        },
        {
          "measure": "fcdead",
          "unit": "%",
          "dates": ["20251003", "20251008", ...],
          "median": [62, 62, ...],
          "change_rate": [0, 0, ...],
          "captured": [100, 92, ...]
        },
        {
          "measure": "fcbare",
          "unit": "%",
          "dates": ["20251003", "20251008", ...],
          "median": [18, 21, ...],
          "change_rate": [2, 3, ...],
          "captured": [100, 92, ...]
        }
      ],
    },
    {
      "paddock_id": "b6ad9142-b6b9-4c54-98f7-08a9631961cb",
      ...
    }
  ]
}
```

Notes:
- three statistics objects are added to the response, one each for
  the green, dead and bare fractions

See also:
- /gettsdmstats



### Order endpoints

Submit requests to order data or reports for the farm.
The request triggers processing on the backend.
The response is a link to a URL to download a file when the
processing is complete. The caller must poll the URL and download the file
when it becomes available.

#### /downloaddata

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

GET https://data.pasturekey.cibolabs.com/downloaddata/20250521/e354f641-fce2-4299-a7d4-561dc31597d2?product=nbar&product=tsdm 

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

### Device endpoints

#### /newdevice

Create a new device and return the device ID. This is a POST request and takes no parameters. The returned
JSON contains the newly allocated device ID. This device ID can be used with the /adddevicepointaoi endpoint
as described below.

** Request **

```bash
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/newdevice"
```

** Response **

```json
{
    "device_id": "cbcd085f-0865-46d8-b496-ce5c2291943b"
}
```

#### /adddevicepointaoi

Add an AOI to an existing device. The is a POST request and it takes parameters on the endpoint
path. These parameters describe the AOI its center (given as longitude and latitude in decimal degrees) and radius 
in metres. The response is JSON and contains the AOI ID of the newly created AOI.

Once the AOI is added and the backprocessing has completed then data will be able to be
queried on the device and AOI with the endpoints described above.

** Request **

```bash
device_id=cbcd085f-0865-46d8-b496-ce5c2291943b
longitude=144.1
latitude=-27.1
radius=200
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/adddevicepointaoi/${device_id}/${longitude}/${latitude}/${radius}"
```

** Response **

```json
    {
        "aoi_id": "8531fb3f-3fdd-4f19-a95a-071d9f0b2fc3"
    }
```

#### /deletedeviceaoi

Delete a device AOI. This is a POST request and takes the device ID and  AOI ID as a path parameters.
Once a call to the endpoint has been made, the data for the AOI will no longer be updated
by the backend.

```bash
device_id=cbcd085f-0865-46d8-b496-ce5c2291943b
aoi_id=8531fb3f-3fdd-4f19-a95a-071d9f0b2fc3
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/deletedeviceaoi/${device_id}/${aoi_id}"
```

** Response **

```json
    {
    	"message": "AOI 8531fb3f-3fdd-4f19-a95a-071d9f0b2fc3 deleted"
    }
```

#### /canceldevice

Cancel a device. Any AOIs for the device will no longer be updated by the backend.
This endpoint takes a single path parameter which is the device ID. This is a POST
request.

** Request **

```bash
device_id=cbcd085f-0865-46d8-b496-ce5c2291943b
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/canceldevice/${device_id}"
```

** Response **

```json
    {
        "message": "Device cbcd085f-0865-46d8-b496-ce5c2291943b deleted"
    }
```

### Deprecated endpoints

#### /getpaddocktsdmts

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


#### /geojson

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


## Device workflow example

Below is a worked example for the device endpoints. It creates a new device and AOI then deletes them.

```bash
# create a new device and save the device_id into newdevice.json
curl -s -X POST \
    --output newdevice.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/newdevice"
    
# using the device_id from above, create a new aoi
device_id=`cat newdevice.json | jq -r '.device_id'`
longitude=144.1
latitude=-27.1
radius=200
curl -s -X POST \
    --output newaoi.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/adddevicepointaoi/${device_id}/${longitude}/${latitude}/${radius}"
    
# extract the AOI id
aoi_id=`cat newaoi.json | jq -r '.aoi_id'`

# Now delete the AOI
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/deletedeviceaoi/${device_id}/${aoi_id}"

# and the device
curl -s -X POST \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://data.pasturekey.cibolabs.com/canceldevice/${device_id}"
```


## Chaining

You can chain multiple calls to the PastureKey API endpoints together, in sequence.
When chaining, pass the returned json from one request as the body of the next request.
The result of `/getpaddockinfo` and `/gettsdmstats` can be passed into the `/geom` endpoint to attach 
geometry.
The result of `/gettsdmstats` can be passed back into `/gettsdmstats` to attach statistics
for further paddocks.

### Chaining example 1

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

```bash
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

### Chaining example 2

In this example, we chain 3 calls together:
- /gettsdmstats
- /gettsdmgreenstats
- /getfcstats

/gettsdmstats takes a property_id and optional start/end dates and returns
a JSON object with a list of paddocks and their statistics.

We then pass the output to the /gettsdmgreenstats endpoint. It inserts
a tsdmgreen stats object into the stats list for each paddock, and returns
the updated JSON.

We then pass the output to the /getfcstats endpoint. It inserts
three fc stats objects (fcgreen, fcdead, fcbare) into the stats list
for each paddock, and returns the updated JSON.

Summary of requests:

```
POST https://data.pasturekey.cibolabs.com/gettsdmstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20251001&enddate=20251031

POST https://data.pasturekey.cibolabs.com/gettsdmgreenstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20251001&enddate=20251031

POST https://data.pasturekey.cibolabs.com/getfcstats/e354f641-fce2-4299-a7d4-561dc31597d2?startdate=20251001&enddate=20251031
```

In detail:

```bash
property_id=e354f641-fce2-4299-a7d4-561dc31597d2
startdate=20251001
enddate=20251031

# First call to /gettsdmstats
curl -s -X POST -o output_1.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
     https://data.pasturekey.cibolabs.com/gettsdmstats/${property_id}?startdate=${startdate}&enddate=${enddate}

# Second call to /gettsdmgreenstats
curl -s -X POST -o output_2.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d @output_1.json \
    https://data.pasturekey.cibolabs.com/gettsdmgreenstats/${property_id}?startdate=${startdate}&enddate=${enddate}

# Third call to /getfcstats
curl -s -X POST -o output_3.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d @output_2.json \
    https://data.pasturekey.cibolabs.com/getfcstats/${property_id}?startdate=${startdate}&enddate=${enddate}

```

The final output, output_3.json, contains the requested stats for the paddocks:

```json
{
  "property_id": "e354f641-fce2-4299-a7d4-561dc31597d2",
  "paddocks": [
    {
      "paddock_id": "4c4f1966-7436-4ac1-88c2-8cc8f46969c3",
      "paddock_name": "unknown",
      "stats": [
        {
          "measure": "tsdm",
          "unit": "kg/ha",
          "dates": [
            "20251003",
            "20251008",
            "20251013",
            "20251015",
            "20251018",
            "20251023",
            "20251028"
          ],
          "median": [
            1094,
            1053,
            1031,
            1064,
            1006,
            null,
            null
          ],
          ...
        },
        {
          "measure": "tsdmgreen",
          "unit": "kg/ha",
          "dates": [
            "20251003",
            "20251008",
            "20251013",
            "20251015",
            "20251018",
            "20251023",
            "20251028"
          ],
          "median": [
            257,
            227,
            209,
            205,
            193,
            null,
            null
          ],
          ...
        },
        {
          "measure": "fcgreen",
          "unit": "%",
          "dates": [
            "20251003",
            "20251008",
            "20251013",
            "20251015",
            "20251018",
            "20251023",
            "20251028"
          ],
          "median": [
            62,
            17,
            16,
            15,
            15,
            null,
            null
          ],
          ...
        },
        {
          "measure": "fcdead",
          "unit": "%",
          "dates": [
            "20251003",
            "20251008",
            "20251013",
            "20251015",
            "20251018",
            "20251023",
            "20251028"
          ],
          "median": [
            62,
            17,
            16,
            15,
            15,
            null,
            null
          ],
          ...
        },
        {
          "measure": "fcbare",
          "unit": "%",
          "dates": [
            "20251003",
            "20251008",
            "20251013",
            "20251015",
            "20251018",
            "20251023",
            "20251028"
          ],
          "median": [
            0,
            66,
            68,
            70,
            70,
            null,
            null
          ],
          ...
        }
      ]
    },
    {
      ...
    }
  ]
}
```


### Valid chaining sequences

The following chain of calls are supported:

- passing the result of /gettsdmstats, /gettsdmgreenstats, /gettsdmdeadstats,
  or /getfcstats to /gettsdmstats, /gettsdmgreenstats, /gettsdmdeadstats,
  or /getfcstats
- passing the result of /gettsdmstats, /gettsdmgreenstats, /gettsdmdeadstats or
  /getfcstats to /geom
- passing the result of /getpaddockinfo to /geom

## Handling special cases

### Handling the response time-out limit of 30 seconds

The API has a time-out period of 30 seconds. You may need to shorten the
time-period of your request and make multiple calls to the API.

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
