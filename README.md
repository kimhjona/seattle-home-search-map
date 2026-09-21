# Seattle Home Search Map

An interactive map of Seattle candidate homes plus nearby amenities — built for
a Fremont townhouse hunt (under $1.2M, 3bd/2ba+, built 2011+). 18 candidate
homes, 425 curated amenities, 18 toggleable layers. Mobile-first.

The hosted copy lives as a private Muse artifact ("Seattle Home Search Map");
this repo is the maintainable source. This map is curated, not exhaustive —
it covers the neighborhoods around the candidate homes, not all of Seattle.

## Quickstart

No build step. Serve it locally (needed for the cleanest behavior) and open it:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

`index.html` also opens directly via `file://` — data loads through a plain
`<script>` tag, so there's nothing to bundle.

## Layout

```
index.html            page shell: markup + <script>/<link> tags
assets/css/styles.css all styling (mobile-first; breakpoint at 650px)
assets/js/app.js      map logic: Leaflet setup, layers, popups, places browser
assets/leaflet/       Leaflet 1.9.4 (BSD-2-Clause, vendored)
data/mapData.js       THE DATA — every place on the map, one point per line
scripts/validate.py   schema + coordinate + duplicate checks
scripts/build_single_file.py  assemble dist/index.html (single-file page)
docs/DATA_MODEL.md    the data schema, with examples
CHANGELOG.md          what changed and when
```

## Editing the data

Everything lives in `data/mapData.js`:

```js
"Grocery stores": {
  "color": "#009688",
  "points": [
    {"lat": 47.66159, "lon": -122.33605, "name": "QFC (Wallingford)", "notes": ""},
  ]
}
```

- **Add a place:** append one line to the layer's `points`. Then run the validator.
- **Add a layer:** add a new top-level entry under `layers` with a `color` and
  `points`. It appears automatically in the layer control, legend, and places
  browser — no JS changes needed.
- **Candidate homes** use `color_by: "status"` with a `colors` map instead of a
  single `color`; each home needs `status` (Active/Eliminated/Off market/Under
  contract) and `price`.
- **Colors:** any CSS color. Keep them distinguishable at 6px on a street map.

Then:

```bash
python3 scripts/validate.py          # must exit 0
python3 scripts/build_single_file.py # optional: refresh dist/
```

## Data curation rules

These keep the map trustworthy. They were learned the hard way:

- **Never describe the map as exhaustive.** It's curated around the search area.
- **Closures:** remove a place only with explicit permanent-closure evidence or
  agreement between two independent sources. A stale website, old hours, a
  directory listing, or "closed now" is not proof. When in doubt, keep it.
- **Candidate homes stay fixed** while doing amenity work — don't move, merge,
  or restyle them as a side effect of another change.
- **Restaurants** must be genuine sit-down restaurants, not fast food.
- **Gyms** include climbing gyms (no separate layer). No personal-training-only
  gyms.
- **Deduplicate** against existing markers before adding.

## Mobile design notes

- The map gets most of the screen. Header is slim, the legend ("Map key")
  starts collapsed, the places browser is a short bottom sheet, and background
  controls recede while the sheet is open.
- Breakpoint: `max-width: 650px` (JS `matchMedia` + CSS must stay in sync).
- **Markers must use Leaflet's SVG overlay (`preferCanvas: false`).** In
  Sep 2026 every dot vanished at once on mobile because the markers were drawn
  on one shared canvas that some mobile webviews drop during compositing.
  Never switch back to canvas rendering.

## Single-file build

`python3 scripts/build_single_file.py` inlines CSS/JS/data into
`dist/index.html` (Leaflet stays external). That file mirrors the hosted
artifact's shape and is handy for sharing a snapshot.

## Syncing with the hosted Muse artifact

The artifact ("Seattle Home Search Map" in the Muse library) is a separate
hosted copy — pushing here does **not** update it. To refresh it, ask Roger to
rebuild the artifact from this repo, or make the edit in the artifact and
re-export `data/mapData.js` back here. Known drift as of 2026-09-21: the
hosted copy still shows three permanently-closed places (China Harbor,
Mamnoon, Wallingford Pediatrics); this repo has them removed.

## Credits

- Map library: [Leaflet 1.9.4](https://leafletjs.com) (BSD-2-Clause)
- Tiles: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
