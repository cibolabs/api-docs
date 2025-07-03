# Quickstart

API access requires credentials.
Contact us at [support@cibolabs.com.au](mailto:support@cibolabs.com.au).

This quick start provides linux bash commands to demonstrate how to: 
- Use the credentials we supply you to get an access token
- Request data from our APIs 

We assume: 
- Linux terminal 
- The jq and curl programs are installed 

## Exchange credentials for an access token

Important: for security, do not hard-code your credentials into
scripts, which might leak from code repositories. 

The example assumes you’ve set two environment variables, CIBO_CLIENT_ID and CIBO_CLIENT_SECRET, in your shell session. 


```bash 
# Create a base64 encoded version of your client ID and secret 

CREDENTIALS=$(printf "%s:%s" "$CIBO_CLIENT_ID" "$CIBO_CLIENT_SECRET" | base64 -w 0)

# Exchange your credentials for an access token  

TOKEN=$(curl -s -X POST \ 
    -H "Content-Type: application/x-www-form-urlencoded" \ 
    -H "Authorization: Basic ${CREDENTIALS}" \ 
    -d "grant_type=client_credentials" \ 
    "https://login.cibolabs.com/oauth2/token" \
    | jq -r '.access_token') 

``` 

If successful, the `TOKEN` variable holds the access token.


## Request data from an API

Here, we make a request to the AFM API's `/getimagedates` endpoint. If successful, `data.json` will contain the dates for the available images. You’ll need the `TOKEN` variable created above. 

```bash
curl -s -X GET \ 
    --output data.json \ 
    -H "Content-Type: application/json" \ 
    -H "Authorization: Bearer ${TOKEN}" \ 
    https://data.afm.cibolabs.com/getimagedates 
```

```json
{
  "dates": [
    "20170105",
    "20170110",
    ...
  ]
}
```

Next, call the AFM API’s `/gettsdmstats` endpoint.
It calculates total standing dry matter (TSDM/pasture biomass)
zonal statistics (mean, median, standard deviation, and optional percentiles)
for the geometry in the geojson supplied in the request’s body. If successful, the result (a geojson) is placed in `tsdmstats.geojson`.

The test file, `postcode_2830_g0.geojson` is available in this repository.

Important: the coordinate reference system of the geojson must conform to the standard. That is, a geographic coordinate reference system using the World Geodetic System 1984 (WGS 84) datum, with longitude and latitude in decimal degrees. 


```bash
# Read the text from a geojson file. 
geojson_file="postcode_2830_g0.geojson" 
geojson=$(cat "$geojson_file")  

# Request data 
curl -s -X POST \ 
    --output tsdmstats.geojson \ 
    -H "Content-Type: application/json" \ 
    -H "Authorization: Bearer ${TOKEN}" \ 
    -d "$geojson" \ 
    "https://data.afm.cibolabs.com/gettsdmstats?startdate=20240201&enddate=20241231&percentiles=10,25,50,75,90" 
```

```json
{
  "type": "FeatureCollection",
  "name": "three_parcels_g0",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ogc_fid": 2194,
        "fid": 2061,
        "objectid": 2061,
        "id": "2830",
        "name": "Western Plains Regional (A)",
        "stats": [
          {
            "measure": "tsdm",
            "unit": "kg/ha",
            "area": 311.3033663612648,
            "aggregate": "yes",
            "dates": [
              "20240203",
              "20240208",
              ...
            ],
            "captured": [
              98.78542510121457,
              86.43724696356276,
              ...
            ],
            "mean": [
              2380.6045918367345,
              2627.0845481049564,
              ...
            ],
            "std": [
              892.5180380497758,
              697.6718103454828,
              ...
            ],
            "median": [
              2320.0,
              2600.0,
              ...
            ],
            "p10": [
              1010.0,
              1032.0,
              ...
            ],
            ...
          }
        ],
      }
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                148.326368206000097,
                -31.792641654999944
              ],
              ...
            ]
          ]
        ]
      }
    }
  ]
}
```
