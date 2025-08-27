# Cibolabs API

The cibolabs APIs provide access to data for two cibolabs services:
- The Agricultural Feedbase Monitor (AFM)
- Pasture Key

Learn more about these services at [cibolabs.com.au](https://cibolabs.com.au).

## Quick links

- [Quick start](quickstart.md)
- [Login API](login.md)
- [AFM API](afm.md)
- [AFM Tile API](afm_tile.md)
- [Pasture Key API](pasturekey.md)
- [Pasture Key Tile API](pasturekey_tile.md)
- [Demo Pasture Key Web App](docs/README.md)

## The AFM API

AFM measures pasture biomass and ground cover for supported territories
(e.g. Australia) using satellite imagery, captured every five days. The
image data are processed at 80 m resolution.
[View the maps here](https://www.cibolabs.com.au/products/national-comparsion/).

The AFM API calculates pasture biomass and ground cover statistics
(the mean, standard deviation, etc) for areas of interest over time.
The data are extracted from the images and the statistics calculated at the
time of the request. 

[AFM API](afm.md)

## The AFM Tile API

Use the AFM Tile API to retrieve raster products, in png file format,
to display in web mapping applications.

The tile API follows the
[XYZ tile protocol](https://en.wikipedia.org/wiki/Tiled_web_map),
which is a standard for serving tiles over the web.

[AFM Tile API](afm_tile.md)

## The Pasture Key API

Pasture Key is like AFM. However, it measures pasture biomass and ground
cover for paddocks at high detail, 10 m, resolution. Data are processed
for every satellite overpass, which is typically every 5 days.

The Pasture Key API provides access to pasture biomass and ground cover
statistics for a farm's paddocks over time.

The Pasture Key API requires that you or your customers have an active
Pasture Key subscription. This is because the statistics are pre-computed
(at every satellite overpass) and stored in our database for fast retrieval.

[Pasture Key API](pasturekey.md)

[Demo Pasture Key Web App](docs/README.md)

## The Pasture Key Tile API

Use the Pasture Key Tile API to retrieve raster products, in png file format,
to display in web mapping applications.

The tile API follows the
[XYZ tile protocol](https://en.wikipedia.org/wiki/Tiled_web_map),
which is a standard for serving tiles over the web.

[Pasture Key Tile API](pasturekey_tile.md)

## Accessing the APIs

Access requires credentials.
Contact us at [support@cibolabs.com.au](mailto:support@cibolabs.com.au).

Exchange your credentials for an access token using the [Login API](login.md).

## A typical workflow

A typical workflow is:
- Use our login end point to exchange your credentials for an access token
- Pass the access token in the `Authorization` header of your http requests to
  our APIs' endpoints
