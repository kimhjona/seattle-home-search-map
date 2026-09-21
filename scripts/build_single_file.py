#!/usr/bin/env python3
"""Assemble a single-file dist/index.html from the multi-file repo.

Mirrors the shape of the hosted Muse artifact (one self-contained page).
Leaflet stays as external files under dist/assets/leaflet.

Usage: python3 scripts/build_single_file.py
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def main():
    shutil.rmtree(DIST, ignore_errors=True)
    (DIST / "assets").mkdir(parents=True)
    shutil.copytree(ROOT / "assets" / "leaflet", DIST / "assets" / "leaflet")

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "assets" / "css" / "styles.css").read_text(encoding="utf-8")
    js_data = (ROOT / "data" / "mapData.js").read_text(encoding="utf-8")
    js_app = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="assets/css/styles.css" />',
        "<style>\n" + css.rstrip() + "\n  </style>",
        1,
    )
    html = html.replace(
        '  <script src="data/mapData.js"></script>\n  <script src="assets/js/app.js"></script>',
        "  <script>\n" + js_data.rstrip() + "\n  </script>\n"
        "  <script>\n" + js_app.rstrip() + "\n  </script>",
        1,
    )
    assert 'href="assets/css/styles.css"' not in html and 'src="assets/js/app.js"' not in html \
        and 'src="data/mapData.js"' not in html
    (DIST / "index.html").write_text(html, encoding="utf-8")
    print(f"wrote {DIST / 'index.html'} ({len(html) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
