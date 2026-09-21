# AGENTS.md — for LLMs working on this repo

You are working on a curated Seattle home-search map. Read this before changing anything.

## The one rule

`data/mapData.js` is the product. `index.html`, `assets/css/styles.css`, and
`assets/js/app.js` are the frame. Prefer data edits; touch the frame only when
the feature genuinely needs it.

## Workflow

1. Edit `data/mapData.js` (one point per line; keep that format).
2. Run `python3 scripts/validate.py` — it must exit 0 with no errors.
3. If you touched CSS/JS, also run `python3 scripts/build_single_file.py` and
   smoke-test `dist/index.html`.
4. Update `CHANGELOG.md` with what changed.

## Data rules (non-negotiable)

- Never describe the map as exhaustive. It covers the search area, not Seattle.
- Remove a place only with explicit permanent-closure evidence, or two
  independent sources agreeing. Stale websites, old hours, directory listings,
  and "closed now" badges are not proof. Ambiguous = keep.
- Candidate homes are fixed during amenity work. Don't move, merge, or restyle
  them as a side effect of another edit.
- Restaurants = genuine sit-down restaurants. No fast food.
- Climbing gyms go under Gyms (no separate layer). No personal-training-only gyms.
- Deduplicate new points against existing markers first (validator catches
  exact dupes; near-dupes are your job).
- Coordinates: Seattle bbox is roughly 47.30–47.90, -122.70–-122.05. The
  validator enforces it.

## Code rules

- Mobile-first. The `650px` breakpoint appears in both CSS and JS
  (`matchMedia`) — change both or neither.
- Markers MUST stay on Leaflet's SVG overlay (`preferCanvas: false` in the
  map constructor). Canvas rendering once made every dot vanish at once on
  mobile webviews (Sep 2026). Do not "optimize" this back.
- New layers need zero JS: add the layer object to `data/mapData.js` and it
  appears in the layer control, legend, key, and places browser automatically.
- Keep the no-build-step property: the page must work from `file://` and from
  any static server. No npm, no bundler, no framework.

## Schema

See `docs/DATA_MODEL.md`. Short version: layers map to
`{color | (color_by + colors), points: [{lat, lon, name, notes?, ...}]}`.
Candidate homes additionally require `status` and `price` per point.

## Syncing

This repo does not auto-update the hosted Muse artifact, and the artifact does
not auto-update this repo. If the user asks for the live map to reflect repo
changes, say so explicitly — it needs a manual rebuild step.
