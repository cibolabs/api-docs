#!/usr/bin/env bash
#
# pkey_afm_woody_stats.sh
#
# Demonstrates how to combine the Pasture Key and AFM APIs to produce a
# GeoJSON with per-paddock pasture stats and woody vegetation stats.
#
# Workflow:
#   1. Authenticate to get an access token
#   2. Call Pasture Key /geom to get a GeoJSON with the farm's paddock geometries
#   3. Call AFM /getwoodychangeyears to find the most recent woody change year
#   4. Call AFM /getwoodychangestats, passing the geom GeoJSON as the
#      area of interest, to get per-paddock woody stats
#   5. Print the result
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

FARMID="340dec85-ac4b-422d-beec-a7304b596fb3"

PKEY_BASE="https://data.pasturekey.cibolabs.com"
AFM_BASE="https://data.afm.cibolabs.com"
LOGIN_URL="https://login.cibolabs.com/oauth2/token"

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
# Pasture Key: geom — GeoJSON with the farm's paddock geometries
# ---------------------------------------------------------------------------

echo ""
echo "--- Pasture Key: paddock geometries ---"

GEOM_FILE="geom_${FARMID}.json"

#curl -s -X POST \
#    -H "Content-Type: application/json" \
#    -H "Authorization: Bearer ${TOKEN}" \
#    "${PKEY_BASE}/geom/${FARMID}" \
#    | jq '.' > "${GEOM_FILE}"
#
#echo "Saved to ${GEOM_FILE}"

# ---------------------------------------------------------------------------
# AFM: find the most recent woody change year
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: most recent woody change year ---"

WOODY_YEAR=$(curl -s -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${AFM_BASE}/getwoodychangeyears" \
    | jq -r '.dates[-1]')

echo "${WOODY_YEAR}"

# ---------------------------------------------------------------------------
# AFM: woody change stats — per-paddock, using geom GeoJSON as input
# ---------------------------------------------------------------------------

echo ""
echo "--- AFM: woody change stats for ${WOODY_YEAR} (per paddock) ---"

WOODY_STATS_FILE="woody_stats_${FARMID}_${WOODY_YEAR}.json"

curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "@${GEOM_FILE}" \
    "${AFM_BASE}/getwoodychangestats?startyear=${WOODY_YEAR}&endyear=${WOODY_YEAR}&reportby=unique" \
    | jq '.' > "${WOODY_STATS_FILE}"

echo "Saved to ${WOODY_STATS_FILE}"
