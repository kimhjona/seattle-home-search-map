# Changelog

## 2026-09-23 — Sync-run near-duplicates fixed

- The 14:05 sync added **4514 Corliss Ave N Unit A** and **3646A Greenwood Ave
  N Unit B** as new markers, but both homes were already on the map under
  their old Property names ("4514 A Corliss Ave N", "3646 B Greenwood Ave N"
  — Jon has since renamed them in the sheet). Removed the two duplicate
  markers and renamed the existing ones to the sheet's current Property
  values, keeping their Redfin links and refreshing notes from Jon's latest
  sheet notes.
- The sync job now matches on the Address column (city/state/zip stripped)
  first, and reports Property renames instead of re-adding them.
- `scripts/validate.py` now also warns when two points share coordinates
  under different names (the old check keyed on name too, so same-spot
  renames slipped through).
- Counts back to 444 markers (19 candidate homes + 425 amenities), 18 layers.
  Validated clean, pushed to main.

## 2026-09-23 — Sync-run duplicate fixed

- The 02:05 hourly sync misread the map data and re-added **4516 B Corliss
  Ave N** (already on the map since 2026-09-22), creating a duplicate marker
  and corrupting the Woodlawn point's `urls` array. Both issues are fixed:
  one 4516 B marker, Woodlawn links restored. Counts back to 444 markers
  (19 candidate homes + 425 amenities), 18 layers. Validated, pushed to main.
- The sync job's matching rules were tightened so it no longer re-adds a
  marker whose name already exists.

## 2026-09-22 — Clickable Redfin listings on candidate homes

- Every Candidate homes point now has a `url` (the Woodlawn cluster has
  `urls` with one link per listed unit), sourced from the property sheet's
  Listing URL column.
- Candidate-home popups show a "View Redfin listing" link that opens in a
  new tab.

## 2026-09-22 — README amenity count fix

- Fixed README header: 426 → 425 curated amenities (444 total markers minus
  19 candidate homes), matching the CHANGELOG.

## 2026-09-22 — Sync from property sheet

- Added **4516 B Corliss Ave N** ($1,224,900, Active) from the property
  comparison sheet (Prime Development, 3bd/3ba, MLS 2559616; price cut
  9/1/26 from $1,249,900). Geocoded 47.66191, -122.33088.
- Map now has **444 markers** (19 candidate homes + 425 amenities).

## 2026-09-21 — Repo export

- Exported the map to this repo as a maintainable multi-file project
  (`index.html` + `assets/css/styles.css` + `assets/js/app.js` +
  `data/mapData.js`), split from the hosted single-file artifact.
- Data is the closure-audit-corrected set: **443 markers, 18 layers**
  (18 candidate homes + 425 amenities). Permanently-closed China Harbor,
  Mamnoon, and Wallingford Pediatrics are removed.
- Fixed: Float therapy layer had no color, so its dots rendered near-white
  and were nearly invisible. Assigned `#00acc1` (cyan).
- Added `scripts/validate.py` (schema/coordinate/duplicate checks) and
  `scripts/build_single_file.py` (reassemble a single-file `dist/` page).
- Added README, AGENTS.md (LLM operating guide), docs/DATA_MODEL.md.

Known drift: the hosted Muse artifact still shows the three closed places
above; it needs a manual rebuild from this repo to catch up.

## 2026-09-21 — Dots fix (hosted artifact)

- All markers vanished on mobile: they were drawn on one shared canvas that
  some mobile webviews drop during compositing. Moved every marker to
  Leaflet's SVG overlay (`preferCanvas: false`).

## 2026-09-21 — Mobile rebuild (hosted artifact)

- Slimmer mobile header, compact Places button, collapsible map key (starts
  closed on mobile), shorter bottom-sheet places browser, single category
  selector on mobile, background controls recede while the sheet is open.

## 2026-09-21 — Closure audit

- Removed permanently-closed China Harbor and Mamnoon (restaurants).
- Wallingford Pediatrics (permanently closed) already removed.
- Ambiguous cases retained (e.g. Snappy Dragon, Mondello, Wedgwood Broiler,
  University Branch Library, Walgreens #6890).

## 2026-09-20 — Map created

- Initial map: 18 candidate homes (one marker per home; the four Woodlawn
  units share a single "Bungalow 4 on Woodlawn" marker) plus 17 amenity
  layers around Fremont/Wallingford/Green Lake.
