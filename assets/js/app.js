// Seattle Home Search Map — application logic.
// Data: ../../data/mapData.js must load before this file (see index.html).
// Markers use Leaflet SVG circleMarkers (NOT canvas): some mobile webviews
// drop the shared canvas during compositing and every dot vanishes at once.

    const allPlaces = [];
    const markerIndex = new Map();
    let map;

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    const colorFor = (category, point) => {
      const layer = mapData.layers[category];
      return layer.color_by === "status" ? layer.colors[point.status] : layer.color;
    };
    const placeKey = (category, point, index) => `${category}-${index}-${point.name}`;
    const listingLinks = (point) => {
      if (Array.isArray(point.urls) && point.urls.length) {
        return point.urls.map(u => `<a class="popup-link" href="${escapeHtml(u.url)}" target="_blank" rel="noopener">${escapeHtml(u.label)} &#8599;</a>`).join("<br>");
      }
      if (point.url) {
        return `<a class="popup-link" href="${escapeHtml(point.url)}" target="_blank" rel="noopener">View Redfin listing &#8599;</a>`;
      }
      return "";
    };
    const popupHtml = (category, point) => {
      const meta = category === "Candidate homes" ? `${escapeHtml(point.status)} · ${escapeHtml(point.price)}` : escapeHtml(category);
      const links = category === "Candidate homes" ? listingLinks(point) : "";
      return `<p class="popup-name"><strong>${escapeHtml(point.name)}</strong></p><p class="popup-meta">${meta}</p>${point.notes ? `<p class="popup-notes">${escapeHtml(point.notes)}</p>` : ""}${links ? `<p class="popup-links">${links}</p>` : ""}`;
    };

    function makePlaceCard(place, interactive = true) {
      const meta = place.category === "Candidate homes"
        ? `${place.point.status} · ${place.point.price}${place.point.notes ? ` · ${place.point.notes}` : ""}`
        : `${place.category}${place.point.notes ? ` · ${place.point.notes}` : ""}`;
      return `<article class="place-card" data-category="${escapeHtml(place.category)}">
        <i class="place-dot" style="--dot:${place.color}" aria-hidden="true"></i>
        <div><h3 class="place-name">${escapeHtml(place.point.name)}</h3><p class="place-meta">${escapeHtml(meta)}</p></div>
        ${interactive ? `<button class="place-button" type="button" data-place-key="${escapeHtml(place.key)}">View</button>` : ""}
      </article>`;
    }

    function populateLists() {
      const list = document.getElementById("placeList");
      list.innerHTML = allPlaces.map(place => makePlaceCard(place)).join("");
      list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-place-key]");
        if (!button || !map) return;
        const marker = markerIndex.get(button.dataset.placeKey);
        const place = allPlaces.find(item => item.key === button.dataset.placeKey);
        if (!marker || !place) return;
        closePlaces();
        map.setView([place.point.lat, place.point.lon], 16, { animate: true });
        window.setTimeout(() => marker.openPopup(), 260);
      });

      const tabs = document.getElementById("categoryTabs");
      const select = document.getElementById("categorySelect");
      const categories = ["All", ...Object.keys(mapData.layers)];
      const filterPlaces = category => {
        list.querySelectorAll(".place-card").forEach(card => {
          card.hidden = category !== "All" && card.dataset.category !== category;
        });
      };
      tabs.innerHTML = categories.map((name, i) => `<button type="button" data-filter="${escapeHtml(name)}" aria-pressed="${i === 0}">${escapeHtml(name)}</button>`).join("");
      select.innerHTML = categories.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
      tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");
        if (!button) return;
        tabs.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        select.value = button.dataset.filter;
        filterPlaces(button.dataset.filter);
      });
      select.addEventListener("change", () => {
        tabs.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item.dataset.filter === select.value)));
        filterPlaces(select.value);
      });

      const fallback = document.getElementById("fallbackList");
      fallback.innerHTML = Object.keys(mapData.layers).map(category => `<h2>${escapeHtml(category)}</h2>${allPlaces.filter(place => place.category === category).map(place => makePlaceCard(place, false)).join("")}`).join("");
    }

    function openPlaces() {
      document.getElementById("placesPanel").classList.add("open");
      document.getElementById("placesPanel").setAttribute("aria-hidden", "false");
      document.getElementById("browseButton").setAttribute("aria-expanded", "true");
      document.body.classList.add("panel-open");
      if (window.matchMedia("(max-width: 650px)").matches) setLegend(false);
    }
    function closePlaces() {
      document.getElementById("placesPanel").classList.remove("open");
      document.getElementById("placesPanel").setAttribute("aria-hidden", "true");
      document.getElementById("browseButton").setAttribute("aria-expanded", "false");
      document.body.classList.remove("panel-open");
    }
    const legend = document.getElementById("mapLegend");
    const legendToggle = document.getElementById("legendToggle");
    const smallScreen = window.matchMedia("(max-width: 650px)");
    function setLegend(open) {
      legend.classList.toggle("is-open", open);
      legendToggle.setAttribute("aria-expanded", String(open));
    }
    setLegend(!smallScreen.matches);
    legendToggle.addEventListener("click", () => setLegend(!legend.classList.contains("is-open")));
    document.getElementById("browseButton").addEventListener("click", openPlaces);
    document.getElementById("closePanel").addEventListener("click", closePlaces);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closePlaces();
        if (smallScreen.matches) setLegend(false);
      }
    });

    try {
      if (!window.L) throw new Error("Leaflet unavailable");
      // Keep hundreds of points in Leaflet's SVG overlay instead of a single canvas.
      // Some mobile webviews drop that canvas during map compositing, which makes
      // every point disappear at once even though the layers remain enabled.
      map = L.map("map", { zoomControl: true, preferCanvas: false, tap: true });
      let tileLoaded = false;
      let tileErrors = 0;
      const tileStatus = document.getElementById("mapStatus");
      const baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      });
      baseLayer.on("tileload", () => {
        tileLoaded = true;
        tileStatus.hidden = true;
      });
      baseLayer.on("tileerror", () => {
        tileErrors += 1;
        if (tileErrors >= 3) window.setTimeout(() => {
          if (!tileLoaded) tileStatus.hidden = false;
        }, 500);
      });
      baseLayer.addTo(map);

      const overlays = {};
      const bounds = [];
      Object.entries(mapData.layers).forEach(([category, layer]) => {
        const group = L.layerGroup().addTo(map);
        overlays[category] = group;
        layer.points.forEach((point, index) => {
          const color = colorFor(category, point);
          const key = placeKey(category, point, index);
          const marker = L.circleMarker([point.lat, point.lon], {
            radius: category === "Candidate homes" ? 8 : 6,
            color: "#ffffff",
            weight: 2,
            fillColor: color,
            fillOpacity: .95
          }).bindPopup(popupHtml(category, point));
          marker.addTo(group);
          markerIndex.set(key, marker);
          allPlaces.push({ key, category, point, color });
          bounds.push([point.lat, point.lon]);
        });
      });

      L.control.layers(null, overlays, {
        collapsed: window.matchMedia("(max-width: 650px)").matches,
        position: "topright"
      }).addTo(map);
      map.fitBounds(bounds, { paddingTopLeft: [30, 84], paddingBottomRight: [30, 80], maxZoom: 14 });
      populateLists();
      window.setTimeout(() => map.invalidateSize(), 0);
    } catch (error) {
      Object.entries(mapData.layers).forEach(([category, layer]) => layer.points.forEach((point, index) => allPlaces.push({ key: placeKey(category, point, index), category, point, color: colorFor(category, point) })));
      populateLists();
      document.getElementById("fallback").hidden = false;
      document.getElementById("browseButton").hidden = true;
      document.getElementById("placesPanel").hidden = true;
    }
