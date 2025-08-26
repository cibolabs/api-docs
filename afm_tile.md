# AFM Tile API

CiboLabs's [National Comparison app](https://www.cibolabs.com.au/products/national-comparison/)
demonstrates what is possible with the AFM Tile API.

See our [online AFM Tile API docs](https://tiles.national.cibolabs.com/swagger)
for the list of endpoints.

## Examples

These examples use the curl program in a Linux terminal
to send requests to the API. They assume:
- you have curl installed
- you have exchanged your credentials for an access token
  (see the [Quickstart](quickstart.md) for how to do this).
  The access token is stored in the `TOKEN` variable

The AFM Tile API endpoints return image tiles in the PNG file format.
Below, we demonstrate the mechanics of making HTTP requests for tiles.
However, the returned PNGs may be of little practical use outside of a
web mapping application.

Although it uses the Pasture Key Tile API, our
[demo Pasture Key app](docs/README.md) shows how to display
tiles in a web mapping application. The same approach can be used to build
a web mapping application using the tiles returned from the AFM Tile API.

### /getimagedates

Note: /getimagedates is a method of the
[AFM API](afm.md). It returns a list of dates for which the AFM
has image data available. Use one of these dates when calling
the AFM Tile API.

See [/getimagedates](afm.md#getimagedates) for details.

### /tsdm

Get a Total Standing Dry Matter (TSDM) web map tile for 21 August 2025 at 
zoom level 7 and tile grid X=115, Y=74.

```bash
curl -X GET \
    --output "tsdm_20250821_7_115_74.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.national.cibolabs.com/tsdm/20250821/7/115/74"
```

### /percentiletsdm

Get an image tile of the TSDM decile. Each pixel is coloured according
to its decile rank (compared to a reference dataset) of
Total Standing Dry Matter (TSDM).

```bash
curl -X GET \
    --output "percentiletsdm_20250821_7_115_74.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.national.cibolabs.com/percentiletsdm/20250821/7/115/74"
```

### /fractionalcover

Get an image tile of fractional cover. Each pixel is coloured according to
the proportions of these three fractions:
- red: fraction of bare ground
- green: fraction of green vegetation cover
- blue: fraction of dead vegetation cover

```bash
curl -X GET \
    --output "fractionalcover_20250821_7_115_74.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.national.cibolabs.com/fractionalcover/20250821/7/115/74"
```

### /nbar

Get an image tile of image reflectance. NBAR is a technical term meaning
nadir-view, BRDF-adjusted surface reflectance.

```bash
curl -X GET \
    --output "nbar_20250821_7_115_74.png" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: image/png" \
    "https://tiles.national.cibolabs.com/nbar/20250821/7/115/74"
```


### /legend

The pixels of of the tiles are coloured. The colours
represents a measurement range or category.
For example, for the TSDM product, the pasture biomass of red pixels is less
than 250 kg/ha.

Call the /legend endpoint to return a text version of the colour table.

/legend does not support the fractionalcover product.
Please contact us if you
need a legend for fractional cover to display in your application.

Nor does /legend support the nbar product.
No colour table is required because it is a reflectance image.


```bash
curl -X GET \
    --output "tsdm_legend.json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/json" \
    "https://tiles.national.cibolabs.com/legend/tsdm"
```

tsdm_legend.json:

```json
{
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
    {
      "label": "250 - 500",
      "color": [
        234,
        99,
        62
      ]
    },
    {
      "label": "500 - 750",
      "color": [
        253,
        174,
        97
      ]
    },
    ...
  ]
}
```
