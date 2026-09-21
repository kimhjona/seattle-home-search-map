#!/usr/bin/env python3
"""Validate data/mapData.js schema, counts, coordinates, and duplicates.

Usage: python3 scripts/validate.py
Exit 0 = clean. Prints per-layer counts plus warnings/errors.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Seattle bounding box (generous)
LAT_MIN, LAT_MAX = 47.30, 47.90
LON_MIN, LON_MAX = -122.70, -122.05
HOME_STATUSES = {"Active", "Eliminated", "Off market", "Under contract"}


def load_data():
    text = (ROOT / "data" / "mapData.js").read_text(encoding="utf-8")
    start = text.index("{")
    end = text.rindex("}")
    return json.loads(text[start:end + 1])


def main():
    errors, warnings = [], []
    data = load_data()

    center = data.get("center")
    if not (isinstance(center, list) and len(center) == 2
            and LAT_MIN <= center[0] <= LAT_MAX and LON_MIN <= center[1] <= LON_MAX):
        errors.append(f"bad center: {center!r}")

    layers = data.get("layers")
    if not isinstance(layers, dict) or not layers:
        errors.append("layers must be a non-empty object")
        layers = {}

    seen = {}  # (lat, lon, name) -> layer
    total = 0
    print(f"{'layer':32s} {'count':>6s}")
    for name, layer in layers.items():
        points = layer.get("points")
        if not isinstance(points, list):
            errors.append(f"[{name}] points is not a list")
            continue
        if "color_by" in layer:
            if "colors" not in layer or not isinstance(layer["colors"], dict):
                errors.append(f"[{name}] color_by set but colors missing/not an object")
        elif "color" not in layer:
            warnings.append(f"[{name}] has no color or color_by; dots render white")
        for i, p in enumerate(points):
            total += 1
            where = f"[{name} #{i}]"
            if not isinstance(p.get("name"), str) or not p["name"].strip():
                errors.append(f"{where} missing name")
            lat, lon = p.get("lat"), p.get("lon")
            if not (isinstance(lat, (int, float)) and LAT_MIN <= lat <= LAT_MAX):
                errors.append(f"{where} {p.get('name')!r} bad lat: {lat!r}")
            if not (isinstance(lon, (int, float)) and LON_MIN <= lon <= LON_MAX):
                errors.append(f"{where} {p.get('name')!r} bad lon: {lon!r}")
            key = (round(float(lat), 5) if isinstance(lat, (int, float)) else lat,
                   round(float(lon), 5) if isinstance(lon, (int, float)) else lon,
                   p.get("name"))
            if key in seen:
                errors.append(f"{where} duplicate of {seen[key]}: {p.get('name')!r}")
            seen[key] = where
            if name == "Candidate homes":
                if p.get("status") not in HOME_STATUSES:
                    errors.append(f"{where} bad status: {p.get('status')!r}")
                if not p.get("price"):
                    warnings.append(f"{where} home has no price")
        print(f"{name:32s} {len(points):>6d}")

    # same name appearing in two different layers is usually a data-entry slip
    by_name = {}
    for (lat, lon, pname), where in seen.items():
        by_name.setdefault(pname, set()).add(where.split(" #")[0].strip("[]"))
    for pname, wheres in by_name.items():
        if len(wheres) > 1:
            warnings.append(f"{pname!r} appears in layers: {sorted(wheres)}")

    print(f"{'TOTAL':32s} {total:>6d}")
    for w in warnings:
        print("WARN:", w)
    for e in errors:
        print("ERROR:", e)
    if errors:
        print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
        sys.exit(1)
    print(f"\nclean ({len(warnings)} warning(s))")


if __name__ == "__main__":
    main()
