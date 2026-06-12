# Troubleshooting

## Known constraints

| Constraint | Detail |
|---|---|
| Request timeout | All APIs have a 30-second timeout. Requests that exceed this receive a `504` response. |
| Size limit | Request bodies and responses are capped at 6 MB. Requests or responses that exceed this receive a `502` response. |
| Access tokens | Access tokens expire after 24 hours. Expired tokens receive a `401` response. See the [Login API](login.md) for how to obtain a new token. |

## HTTP error codes

### 400 — Bad Request

The request could not be understood by the server. Common causes:

- **Invalid date format** — dates must be in `YYYYMMDD` format (e.g. `20240101`, not `2024-01-01`)
- **Malformed or empty request body** — the request body must be valid GeoJSON
- **Missing required parameters** — check the endpoint documentation for required query parameters

### 401 — Unauthorized

Your access token is missing, invalid, or has expired. Access tokens are valid for 24 hours.
Obtain a new token and retry the request. See the [Login API](login.md).

### 403 — Forbidden

A `403` response has two distinct causes — distinguish them by the response body:

- **`{"message": "Missing Authentication Token"}`** — the HTTP method or URL is incorrect.
  For example, using `GET` instead of `POST` on a stats endpoint. Check the API documentation
  for the correct method and URL.
- **Any other body** — your token is valid but you do not have access to the requested resource.
  This typically means the property or subscription is not associated with your account.
  Contact [support@cibolabs.com.au](mailto:support@cibolabs.com.au).

### 502 — Bad Gateway

A `502` response has two possible causes:

- **Size limit exceeded** — the request body or the response exceeds 6 MB. Reduce the size of
  your request (e.g. shorten the date range, reduce the number of features, or split a large
  geometry into smaller parts) and retry.
- **Internal server error** — an unexpected error occurred. If the request is not near the 6 MB
  limit, contact [support@cibolabs.com.au](mailto:support@cibolabs.com.au).

### 504 — Gateway Timeout

The request exceeded the 30-second timeout. Shorten the date range (`startdate` / `enddate`)
and make multiple smaller requests to cover the full period.

## Examples

### AFM: splitting a long date range to avoid a timeout

If an AFM stats request times out, split the date range across multiple requests. The AFM API
supports chaining — the response from a previous request can be passed as the body of the next,
and a new stats object is appended to each Feature's `stats` list.

For example, request year 2023 first (`startdate=20230101&enddate=20231231`), then chain a
second request for year 2024 (`startdate=20240101&enddate=20241231`). The combined response
contains two stats objects in the `stats` list, one per year:

```json
{
  "type": "Feature",
  "properties": {
    "name": "feature_a",
    "aggregate": "yes",
    "stats": [
      {
        "measure": "tsdm",
        "unit": "kg/ha",
        "area": 7850.393436441231,
        "dates": [
          "20230104",
          "20230109",
          "...",
          "20231230"
        ]
      },
      {
        "measure": "tsdm",
        "unit": "kg/ha",
        "area": 7850.393436441231,
        "dates": [
          "20240104",
          "20240109",
          "...",
          "20241230"
        ]
      }
    ]
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": ["..."]
  }
}
```
