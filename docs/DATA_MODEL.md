# Data model

`data/mapData.js` assigns a single global, `mapData`:

```js
const mapData = {
  "center": [47.657, -122.343],   // initial map center [lat, lon]
  "layers": {
    "<Layer name>": { ... },
  }
};
```

## Layer object

Two shapes. Amenity layers use a single color:

```js
"Grocery stores": {
  "color": "#009688",
  "points": [
    {"lat": 47.66159, "lon": -122.33605, "name": "QFC (Wallingford)", "notes": ""},
  ]
}
```

The Candidate homes layer colors by status instead:

```js
"Candidate homes": {
  "color_by": "status",
  "colors": {
    "Active": "#1a73e8",
    "Eliminated": "#9e9e9e",
    "Off market": "#3c4043",
    "Under contract": "#f29900"
  },
  "points": [
    {"lat": 47.66303, "lon": -122.34, "name": "1410 N 47th St Unit B",
     "price": "$995,600", "status": "Active",
     "notes": "Current favorite; open house Sun 1:30-3:30pm"},
  ]
}
```

## Point fields

| field    | required | notes                                                        |
|----------|----------|--------------------------------------------------------------|
| `lat`    | yes      | decimal degrees, Seattle bbox 47.30–47.90                    |
| `lon`    | yes      | decimal degrees, Seattle bbox -122.70–-122.05                |
| `name`   | yes      | display name; keep it short                                  |
| `notes`  | no       | one line, shown in popup and place card                      |
| `price`  | homes    | e.g. `"$995,600"`; shown in popup and place card             |
| `status` | homes    | one of `Active`, `Eliminated`, `Off market`, `Under contract` |
| `address`| no       | kept for maintenance; not displayed                          |

Extra fields are ignored by the app, so you can stash research context (e.g.
`address`) without affecting rendering.

## How the app consumes it

`assets/js/app.js` iterates `Object.entries(mapData.layers)` and builds, per
layer: a Leaflet `layerGroup` of SVG `circleMarker`s (8px radius for homes,
6px otherwise), an entry in the layers control, a legend swatch, and place
cards in the Browse-places panel. Adding a layer to the data is sufficient —
no code changes needed.
