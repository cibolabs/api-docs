# Cibolabs API Docs

Documentation and examples for the Cibolabs suite of satellite-derived agricultural data APIs.

## Language

**Property**:
A farm or station registered with Cibolabs, identified by a UUID (`property_id`). The unit of access for Pasture Key data.
_Avoid_: Farm (acceptable alias in code as `farmid`, but Property is canonical)

**Paddock**:
A named, permanent spatial subdivision of a Property, with its own geometry and independently computed statistics.
_Avoid_: Field, zone, area

**Pasture Key**:
The Cibolabs API for farm-scale satellite-derived pasture data. Operates on registered Properties and their Paddocks.
_Avoid_: PKey (acceptable shorthand in code/URLs)

**AFM (Agricultural Feedbase Monitor)**:
The Cibolabs API for national-scale satellite-derived pasture and vegetation data. Operates on arbitrary areas of interest, not restricted to registered Properties.
_Avoid_: Feedbase monitor

**Image Date**:
The date of a satellite overpass for which processed data is available for a Property.
_Avoid_: Date, overpass date, capture date

**Snapshot**:
The state of a Property's Paddocks at a given Image Date, expressed as a GeoJSON FeatureCollection with per-Paddock statistics.
_Avoid_: Report, export, dump

**Woody Change**:
An AFM analysis of vegetation state transitions between two years, classifying areas as non-woody, primary woodland/forest, or secondary woodland/forest and quantifying gains and losses in hectares.
_Avoid_: Vegetation change, land cover change

**TSDM (Total Standing Dry Matter)**:
Pasture biomass, measured in kg/ha.
_Avoid_: Biomass, feed

**FOO (Feed on Offer)**:
The total pasture biomass available in a Paddock, in kg. Calculated as TSDM (kg/ha) × Paddock area (ha).
_Avoid_: Total feed, available feed

**Fractional Cover (FC)**:
The percentage of a Paddock's surface covered by green vegetation, dead vegetation, and bare ground — three components that sum to 100%.
_Avoid_: Ground cover, vegetation cover

**NBAR (Nadir-view BRDF-Adjusted Reflectance)**:
The surface reflectance product derived from satellite imagery, corrected for viewing angle and atmospheric effects. The underlying data from which TSDM and FC are derived.
_Avoid_: Reflectance, satellite image, raw imagery

## Example dialogue

> **Dev**: So if I want woody stats per paddock, I just pass the Snapshot to AFM?  
> **Expert**: Exactly — the Snapshot is a GeoJSON FeatureCollection, one Feature per Paddock. AFM's `/getwoodychangestats` accepts any FeatureCollection as its area of interest, so with `reportby=unique` each Paddock gets its own Woody Change stats.  
> **Dev**: And the years I pass — where do those come from?  
> **Expert**: Call `/getwoodychangeyears` first. Each year in the response is the *end* year of an analysis period. Pick the one you want and pass it as both `startyear` and `endyear` for a single-period analysis.  
> **Dev**: Got it. And the TSDM and FOO in the Snapshot — those are Pasture Key stats, not AFM?  
> **Expert**: Correct. Pasture Key owns TSDM, FOO, and FC at the Paddock level. AFM owns Woody Change for any area you throw at it.
