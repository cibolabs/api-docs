#!/usr/bin/env bash
#
# pkey_afm_woody_stats.sh
#
# Demonstrates how to combine the Pasture Key and AFM APIs to produce a
# GeoJSON with per-paddock pasture stats and woody vegetation stats.
#
# This is "Demo Farm", viewable in the CiboLabs platform from your dashboard.
# Login at cibolabs.com.au
# FARMID="434b1601-200d-428c-9c6d-1446b05ecc3b"
#
# Workflow:
#   1. Authenticate to get an access token
#   2. Call Pasture Key /geom to get a GeoJSON with the farm's paddock geometries
#   3. Call Pasture Key /getimagedates to find the latest 20 satellite image dates
#   4. Call Pasture Key /gettsdmstats to populate the geomtry with the latest 20 dates of TSDM data
#   5. Call AFM /getwoodychangeyears to find the most recent 2 years of woody data
#   6. Call AFM /getwoodychangestats, to populate the geometry with the most recent 2 years of woody data.
#   7. Print the result
#
# Prerequisites:
#   - curl    (https://curl.se)
#   - jq      (https://jqlang.org)
#   - base64  (part of GNU coreutils, standard on Linux)
#
# Usage:
#   export CIBO_CLIENT_ID=your_client_id
#   export CIBO_CLIENT_SECRET=your_client_secret
#   bash pkey_afm_woody_stats.sh
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

# This is "Demo Farm", viewable in the CiboLabs platform from your dashboard.
FARMID="434b1601-200d-428c-9c6d-1446b05ecc3b"

# Endpoints.
LOGIN_URL="https://login.cibolabs.com/oauth2/token"
PKEY_BASE="https://data.pasturekey.cibolabs.com"
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
# Pasture Key: getimagedates — find the latest 20 satellite image dates
# ---------------------------------------------------------------------------
echo ""
echo "--- Pasture Key: latest 20 satellite image dates ---"
IMAGE_DATES=$(curl -s -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${PKEY_BASE}/getimagedates/${FARMID}" \
    | jq -r '.dates[-20:][]')
# Store the first and last date for use in the next step.
START_DATE=$(echo "${IMAGE_DATES}" | head -n 1)
END_DATE=$(echo "${IMAGE_DATES}" | tail -n 1)

echo "PastureKey Image dates from ${START_DATE} to ${END_DATE}."


# ---------------------------------------------------------------------------
# Pasture Key: gettsdmstats — populate the geometry with the latest 20 dates of TSDM data
# ---------------------------------------------------------------------------
echo ""
echo "--- Pasture Key: TSDM stats for ${START_DATE} to ${END_DATE} ---"
TSDM_STATS_FILE="tsdm_stats_${FARMID}_${START_DATE}_${END_DATE}.json"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${PKEY_BASE}/gettsdmstats/${FARMID}?startdate=${START_DATE}&enddate=${END_DATE}" \
    | jq '.' > "${TSDM_STATS_FILE}"

echo "Saved to ${TSDM_STATS_FILE}"


# ---------------------------------------------------------------------------
# Pasture Key: geom — GeoJSON with the farm's paddock geometries and
# the TSDM stats from above.
# ---------------------------------------------------------------------------

echo ""
echo "--- Pasture Key: paddock geometries ---"

# Call geom.
GEOM_FILE="geom_${FARMID}_geom.json"
curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${TSDM_STATS_FILE}" \
    "${PKEY_BASE}/geom/${FARMID}" \
    | jq '.' > "${GEOM_FILE}"

echo "Saved to ${GEOM_FILE}"

# ---------------------------------------------------------------------------
# AFM: find the most three most recent woody change analysis years
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: three most recent woody change analysis years ---"

WOODY_YEARS_ARRAY=($(curl -s -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${AFM_BASE}/getwoodychangeyears" \
    | jq -r '.dates[]'))

START_YEAR="${WOODY_YEARS_ARRAY[-3]}"  # 3rd from last
END_YEAR="${WOODY_YEARS_ARRAY[-1]}"    # Last element

echo "Woody change years from ${START_YEAR} to ${END_YEAR}."

# ---------------------------------------------------------------------------
# AFM: woody change stats — per-paddock, using geom GeoJSON as input
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: woody change stats for ${START_YEAR} to ${END_YEAR} (per paddock) ---"

WOODY_STATS_FILE="woody_stats_${FARMID}_${START_YEAR}_${END_YEAR}.json"

curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${GEOM_FILE}" \
    "${AFM_BASE}/getwoodychangestats?startyear=${START_YEAR}&endyear=${END_YEAR}&reportby=unique" \
    | jq '.' > "${WOODY_STATS_FILE}"

echo "Saved to ${WOODY_STATS_FILE}"
