#!/usr/bin/env bash
#
# afm_stats.sh
#
# Demonstrates how to chain AFM API calls to gather TSDM, fractional cover
# and rainfall statistics for a geographic region defined by postal code 2830.
#
# Workflow:
#   1. Authenticate to get an access token
#   2. Call AFM /gettsdmstats -- pasture biomass stats for 2025
#   3. Call AFM /getfcstats   -- fractional cover stats (bare, green, dead)
#   4. Call AFM /getrain      -- monthly rainfall stats
#
# Each call chains the output of the previous call as the input body.
# Statistics are appended to the geojson's Feature on each call.
#
# Prerequisites:
#   - curl    (https://curl.se)
#   - jq      (https://jqlang.org)
#   - base64  (part of GNU coreutils, standard on Linux)
#
# Usage:
#   export CIBO_CLIENT_ID=your_client_id
#   export CIBO_CLIENT_SECRET=your_client_secret
#   bash afm_stats.sh
#

set -e

# ---------------------------------------------------------------------------
# Validate environment
# ---------------------------------------------------------------------------

if [[ -z "${CIBO_CLIENT_ID}" ]]; then
    echo "Error: CIBO_CLIENT_ID is not set." >&2
    exit 1
fi

if [[ -z "${CIBO_CLIENT_SECRET}" ]]; then
    echo "Error: CIBO_CLIENT_SECRET is not set." >&2
    exit 1
fi

# Input geojson -- postal code 2830 boundary.
GEOJSON_FILE="postcode_2830_g0.geojson"

# Date range and percentiles.
START_DATE="20250101"
END_DATE="20251231"
PERCENTILES="10,25,50,75,90"

# Endpoints.
LOGIN_URL="https://login.cibolabs.com/oauth2/token"
AFM_BASE="https://data.afm.cibolabs.com"

# ---------------------------------------------------------------------------
# Authenticate
# ---------------------------------------------------------------------------

echo "--- Authenticating ---"

CREDENTIALS=$(printf "%s:%s" "$CIBO_CLIENT_ID" "$CIBO_CLIENT_SECRET" | base64 -w 0)

TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Authorization: Basic ${CREDENTIALS}" \
    -d "grant_type=client_credentials" \
    "${LOGIN_URL}" \
    | jq -r '.access_token')

if [[ -z "${TOKEN}" || "${TOKEN}" == "null" ]]; then
    echo "Error: Failed to obtain access token. Check your credentials." >&2
    exit 1
fi

echo "Token obtained."


# ---------------------------------------------------------------------------
# AFM: gettsdmstats -- pasture biomass stats for 2020-2025
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: TSDM stats for ${START_DATE} to ${END_DATE} ---"

TSDM_FILE="afm_stats_tsdm.geojson"

curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${GEOJSON_FILE}" \
    "${AFM_BASE}/gettsdmstats?startdate=${START_DATE}&enddate=${END_DATE}&percentiles=${PERCENTILES}" \
    | jq '.' > "${TSDM_FILE}"

echo "Saved to ${TSDM_FILE}"


# ---------------------------------------------------------------------------
# AFM: getfcstats -- fractional cover stats (bare, green, dead)
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: FC stats for ${START_DATE} to ${END_DATE} ---"

FC_FILE="afm_stats_tsdm_fc.geojson"

curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${TSDM_FILE}" \
    "${AFM_BASE}/getfcstats?startdate=${START_DATE}&enddate=${END_DATE}&percentiles=${PERCENTILES}" \
    | jq '.' > "${FC_FILE}"

echo "Saved to ${FC_FILE}"


# ---------------------------------------------------------------------------
# AFM: getrain -- monthly rainfall stats
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: Rain stats for ${START_DATE} to ${END_DATE} ---"

RAIN_FILE="afm_stats_tsdm_fc_rain.geojson"

curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${FC_FILE}" \
    "${AFM_BASE}/getrain?startdate=${START_DATE}&enddate=${END_DATE}" \
    | jq '.' > "${RAIN_FILE}"

echo "Saved to ${RAIN_FILE}"
