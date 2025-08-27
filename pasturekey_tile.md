# Pasture Key Tile API

Use the Pasture Key Tile API to retrieve web map tiles for a
farm in CiboLabs's Pasture Key service using the
[XYZ tile protocol](https://en.wikipedia.org/wiki/Tiled_web_map).

See our [online Pasture Key Tile API docs](https://tiles.pasturekey.cibolabs.com/swagger)
for the full list of endpoints.

## Examples

These examples use the curl program in a Linux terminal
to send requests to the API. They assume:
- you have curl installed
- you have exchanged your credentials for an access token
  (see the [Quickstart](quickstart.md) for how to do this).
  The access token is stored in the `TOKEN` variable

The Pasture Key Tile API endpoints return image tiles in the PNG file format.
Below, we demonstrate the mechanics of making HTTP requests for tiles.
However, the returned PNGs may be of little practical use outside of a
web mapping application.

Our [demo Pasture Key app](docs/README.md) shows how to display
tiles in a web mapping application.

### /getimagedates

This endpoint retrieves the available image dates for a property.

**Request**

GET https://tiles.pasturekey.cibolabs.com/getimagedates/434b1601-200d-428c-9c6d-1446b05ecc3b

```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -s -X GET \ 
    --output data.json \ 
    -H "Content-Type: application/json" \ 
    -H "Authorization: Bearer ${TOKEN}" \
    "https://tiles.pasturekey.cibolabs.com/getimagedates/${PROPERTY_ID}"
```

**Response** 

```json
{ 
    "dates": ["20250217", "20250222", "20250227", "20250304", ...]
}
```

### /getbounds

**Request**

GET https://tiles.pasturekey.cibolabs.com/getbounds/e354f641-fce2-4299-a7d4-561dc31597d2

```bash
farmid="e354f641-fce2-4299-a7d4-561dc31597d2"

curl -s -X GET \
    --output data.json \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://tiles.pasturekey.cibolabs.com/getbounds/${farmid}"
```

**Response**

```json
{
  "xmin": 149.768297,
  "xmax": 149.905016937,
  "ymin": -26.840771,
  "ymax": -26.668700369
}
```

### /tsdm

Get a Total Standing Dry Matter (TSDM) web map tile for
property ID 434b1601-200d-428c-9c6d-1446b05ecc3b on 26 August 2025 at
zoom level 13 and tile grid X=7511, Y=4848.

GET https://tiles.pasturekey.cibolabs.com/tsdm/20250826/434b1601-200d-428c-9c6d-1446b05ecc3b/13/7511/4848


```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -X GET \
    --output "tsdm_20250826_13_7511_4848.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.pasturekey.cibolabs.com/tsdm/20250826/${PROPERTY_ID}$/13/7511/4848"
```

### /fractionalcover

Get an image tile of fractional cover. Each pixel is coloured according to
the proportions of these three fractions:
- red: fraction of bare ground
- green: fraction of green vegetation cover
- blue: fraction of dead vegetation cover

GET https://tiles.pasturekey.cibolabs.com/fractionalcover/20250826/434b1601-200d-428c-9c6d-1446b05ecc3b/13/7511/4848

```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -X GET \
    --output "fractionalcover_20250826_13_7511_4848.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.pasturekey.cibolabs.com/fractionalcover/20250826/${PROPERTY_ID}/13/7511/4848"
```

### /nbar

Get an image tile of image reflectance. NBAR is a technical term meaning
nadir-view, BRDF-adjusted surface reflectance.

GET https://tiles.pasturekey.cibolabs.com/nbar/20250826/434b1601-200d-428c-9c6d-1446b05ecc3b/13/7511/4848

```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -X GET \
    --output "nbar_20250826_13_7511_4848.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.pasturekey.cibolabs.com/nbar/20250826/${PROPERTY_ID}/13/7511/4848"
```

### /totalcovercomposite

Get the image tile for a 30-day composite of total cover. Each pixel is coloured according
to its percentage colour.

GET https://tiles.pasturekey.cibolabs.com/totalcovercomposite/20250826/434b1601-200d-428c-9c6d-1446b05ecc3b/13/7511/4848

```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -X GET \
    --output "totalcovercomposite_20250826_13_7511_4848.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.pasturekey.cibolabs.com/totalcovercomposite/20250826/${PROPERTY_ID}/13/7511/4848"
```

### /tsdmchange

Get the image tile for change in TSDM.
The change is computed from two TSDM 30-day composite images about 30-days apart.
So dates in the first 30-days of the farms history (the dates returned from
/getimagedates), don't have a tsdm change image. In such cases, a blank tile
(all pixels are transparent) is returned.

GET https://tiles.pasturekey.cibolabs.com/tsdmchange/20250826/434b1601-200d-428c-9c6d-1446b05ecc3b/13/7511/4848

```bash
PROPERTY_ID="434b1601-200d-428c-9c6d-1446b05ecc3b"
curl -X GET \
    --output "tsdmchange_20250826_13_7511_4848.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.pasturekey.cibolabs.com/tsdmchange/20250826/${PROPERTY_ID}/13/7511/4848"
```

### /legend

The pixels of the tiles are coloured. The colours
represents a measurement range or category.
For example, for the Total Cover product, dark blue pixels have a
vegetation cover of > 90%.

Call the /legend endpoint to return a text version of the colour table.

/legend does not support the fractionalcover product.
Please contact us if you
need a legend for fractional cover to display in your application.

Nor does /legend support the nbar product.
No colour table is required because it is a reflectance image.

**request**

GET https://tiles.pasturekey.cibolabs.com/legend/totalcover

```bash
curl -X GET \
    --output "totalcover_legend.json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/json" \
    "https://tiles.pasturekey.cibolabs.com/legend/totalcovercomposite"
```

**response**

totalcover_legend.json:

```json
{
  "title": "Total Cover (%)",
  "legend": [
    {
      "label": "> 90",
      "color": [
        29,
        49,
        68
      ]
    },
    {
      "label": "80 - 90",
      "color": [
        19,
        78,
        136
      ]
    },
    {
      "label": "70 - 80",
      "color": [
        65,
        122,
        153
      ]
    },
    ...
  ]
}
```
