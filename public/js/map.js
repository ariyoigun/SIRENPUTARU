// public/js/map.js
// Interactive Map Module for SIREN Kabupaten Demak
// Integrates Google Maps API (AIzaSyCyhRYSklF6pnYBmtg2BJp4oCi_Ux3_Esg) & Polygon Boundaries

let googleMap = null;
let currentInfoWindow = null;
let kecamatanPolygons = [];
let projectMarkers = [];
let activePolygon = null;

// Kabupaten Demak geographic center
const DEMAK_CENTER = { lat: -6.9100, lng: 110.6400 };

// Bidang Colors & Icons
const BIDANG_META = {
  "Bina Marga": {
    color: "#2563eb", // Royal Blue
    fill: "#1d4ed8",
    badgeClass: "badge-bm",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19L8 5M20 19L16 5M12 5V19"/></svg>`
  },
  "SDA BK": {
    color: "#0d9488", // Teal
    fill: "#0f766e",
    badgeClass: "badge-sda",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
  },
  "Cipta Karya": {
    color: "#7c3aed", // Violet
    fill: "#6d28d9",
    badgeClass: "badge-ck",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`
  },
  "Tata Ruang": {
    color: "#d97706", // Amber
    fill: "#b45309",
    badgeClass: "badge-trp",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
  }
};

// Custom Google Maps Silver/Navy Style
const MAP_STYLE_DARK_NAVY = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#93c5fd" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bae6fd" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0369a1" }]
  }
];

// Generate SVG marker icon data URL
function createPinIcon(color, textSymbol) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
    <defs>
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.8C16.6 42.1 17.4 42.1 17.9 41.8C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" filter="url(#shadow)"/>
    <circle cx="17" cy="16" r="11" fill="#ffffff"/>
    <circle cx="17" cy="16" r="9" fill="${color}"/>
    <text x="17" y="20" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${textSymbol || '●'}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Initialize Google Maps
function initGoogleMap(containerId = 'googleMap') {
  const mapElement = document.getElementById(containerId);
  if (!mapElement) return;

  if (typeof google === 'undefined' || !google.maps) {
    console.warn("Google Maps API belum termuat. Menjalankan fallback visualisasi...");
    initFallbackVectorMap(containerId);
    return;
  }

  try {
    googleMap = new google.maps.Map(mapElement, {
      center: DEMAK_CENTER,
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      styles: MAP_STYLE_DARK_NAVY,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      streetViewControl: false,
      fullscreenControl: true
    });

    currentInfoWindow = new google.maps.InfoWindow();

    // Render Kecamatan Polygons
    renderKecamatanPolygons();

    // Close InfoWindow on map click
    googleMap.addListener('click', () => {
      if (currentInfoWindow) currentInfoWindow.close();
    });

    console.log("Google Maps initialized successfully.");
  } catch (err) {
    console.error("Gagal menginisialisasi Google Maps:", err);
    initFallbackVectorMap(containerId);
  }
}

// Render Polygons for the 14 Kecamatan
function renderKecamatanPolygons() {
  if (!googleMap || !window.SIREN_DATA || !window.SIREN_DATA.kecamatan) return;

  // Clear existing polygons
  kecamatanPolygons.forEach(p => p.setMap(null));
  kecamatanPolygons = [];

  const kecamatanList = window.SIREN_DATA.kecamatan;

  kecamatanList.forEach(kec => {
    if (!kec.polygon || !kec.polygon.length) return;

    const path = kec.polygon.map(coord => ({ lat: coord[0], lng: coord[1] }));

    const polygon = new google.maps.Polygon({
      paths: path,
      strokeColor: kec.warna || "#1e40af",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: kec.warna || "#3b82f6",
      fillOpacity: 0.18,
      map: googleMap,
      zIndex: 1
    });

    polygon.kecamatanData = kec;

    // Hover effect
    polygon.addListener('mouseover', () => {
      if (activePolygon !== polygon) {
        polygon.setOptions({
          fillOpacity: 0.38,
          strokeWeight: 3,
          strokeColor: '#f59e0b'
        });
      }
    });

    polygon.addListener('mouseout', () => {
      if (activePolygon !== polygon) {
        polygon.setOptions({
          fillOpacity: 0.18,
          strokeWeight: 2,
          strokeColor: kec.warna || "#1e40af"
        });
      }
    });

    // Click handler: Filter to this Kecamatan!
    polygon.addListener('click', (e) => {
      focusKecamatan(kec.nama, polygon);
    });

    kecamatanPolygons.push(polygon);
  });
}

// Focus on a specific Kecamatan
function focusKecamatan(namaKecamatan, polygonObj = null) {
  if (!namaKecamatan) return;

  const kec = window.SIREN_DATA.kecamatan.find(k => k.nama.toLowerCase() === namaKecamatan.toLowerCase());
  if (!kec) return;

  // Highlight polygon
  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.18,
      strokeWeight: 2,
      strokeColor: activePolygon.kecamatanData.warna || "#1e40af"
    });
  }

  if (polygonObj) {
    activePolygon = polygonObj;
  } else {
    activePolygon = kecamatanPolygons.find(p => p.kecamatanData && p.kecamatanData.nama.toLowerCase() === namaKecamatan.toLowerCase());
  }

  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.45,
      strokeWeight: 4,
      strokeColor: '#f59e0b'
    });
  }

  // Center and Zoom Map
  if (googleMap) {
    googleMap.panTo({ lat: kec.lat, lng: kec.lng });
    googleMap.setZoom(12);
  }

  // Trigger app.js filter
  if (window.onKecamatanSelected) {
    window.onKecamatanSelected(kec.nama);
  }
}

// Reset Map to Whole Demak
function resetMapToDemak() {
  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.18,
      strokeWeight: 2,
      strokeColor: activePolygon.kecamatanData.warna || "#1e40af"
    });
    activePolygon = null;
  }

  if (googleMap) {
    googleMap.panTo(DEMAK_CENTER);
    googleMap.setZoom(11);
  }

  if (window.onKecamatanReset) {
    window.onKecamatanReset();
  }
}

// Update Marker Pins on Map based on filtered projects
function updateMapMarkers(projects) {
  if (!googleMap) {
    // If fallback map is active, update fallback view
    updateFallbackMarkers(projects);
    return;
  }

  // Clear existing markers
  projectMarkers.forEach(m => m.setMap(null));
  projectMarkers = [];

  if (!projects || !projects.length) return;

  projects.forEach((proj, index) => {
    if (!proj.lat || !proj.lng) return;

    const meta = BIDANG_META[proj.bidang] || BIDANG_META["Bina Marga"];
    const symbol = proj.bidang === "Bina Marga" ? (proj.sub_bidang === "Jembatan" ? "J" : "R") : (proj.bidang === "SDA BK" ? "W" : (proj.bidang === "Cipta Karya" ? "C" : "T"));
    const iconUrl = createPinIcon(meta.color, symbol);

    const marker = new google.maps.Marker({
      position: { lat: Number(proj.lat), lng: Number(proj.lng) },
      map: googleMap,
      title: proj.nama_pekerjaan,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(30, 38),
        anchor: new google.maps.Point(15, 38)
      },
      animation: google.maps.Animation.DROP,
      zIndex: 10 + index
    });

    marker.projectData = proj;

    marker.addListener('click', () => {
      openMarkerPopup(marker, proj);
    });

    projectMarkers.push(marker);
  });
}

// Open InfoWindow Popup on Marker Click
function openMarkerPopup(marker, proj) {
  if (!currentInfoWindow) return;

  const meta = BIDANG_META[proj.bidang] || BIDANG_META["Bina Marga"];
  const formattedBudget = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(proj.kebutuhan_anggaran || 0);

  // Active year budget if year filter is applied
  const activeYear = window.currentYearFilter || 'Semua';
  let yearBudgetInfo = '';
  if (activeYear !== 'Semua' && proj.anggaran_tahun && proj.anggaran_tahun[activeYear]) {
    const yVal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(proj.anggaran_tahun[activeYear]);
    yearBudgetInfo = `<div class="mt-2 bg-blue-50 border border-blue-200 rounded p-1.5 text-xs text-blue-900 font-medium">
      Alokasi Tahun ${activeYear}: <b>${yVal}</b>
    </div>`;
  }

  const content = `
    <div style="max-width: 300px; font-family: system-ui, sans-serif; padding: 4px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="background: ${meta.color}; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
          ${proj.bidang}
        </span>
        <span style="font-size: 11px; color: #64748b; font-weight: 600;">
          Prioritas ${proj.prioritas || 1}
        </span>
      </div>
      <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.35;">
        ${proj.nama_pekerjaan}
      </h4>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">
        <b>Kecamatan:</b> ${proj.kecamatan || '-'}<br>
        <b>Ruas/Lokasi:</b> ${proj.ruas || '-'}
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px;">
        <span style="color: #64748b;">Total Kebutuhan Anggaran:</span><br>
        <b style="color: #1e40af; font-size: 13px;">${formattedBudget}</b>
      </div>
      ${yearBudgetInfo}
      <button onclick="window.viewProjectDetail('${proj.id}')" style="margin-top: 8px; width: 100%; background: #1e40af; color: #ffffff; border: none; padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; cursor: pointer;">
        Lihat Rincian Lengkap &rarr;
      </button>
    </div>
  `;

  currentInfoWindow.setContent(content);
  currentInfoWindow.open(googleMap, marker);
}

// Center map to a specific project
function focusProjectOnMap(projectId) {
  const marker = projectMarkers.find(m => m.projectData && m.projectData.id === projectId);
  if (marker && googleMap) {
    googleMap.panTo(marker.getPosition());
    googleMap.setZoom(15);
    openMarkerPopup(marker, marker.projectData);
  }
}

// ==========================================
// FALLBACK VECTOR MAP (IF GOOGLE MAPS SCRIPT CANNOT CONNECT)
// ==========================================
function initFallbackVectorMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const kecList = window.SIREN_DATA ? window.SIREN_DATA.kecamatan : [];

  container.innerHTML = `
    <div style="width: 100%; height: 100%; background: #0f172a; color: #ffffff; display: flex; flex-direction: column; border-radius: 1rem; overflow: hidden; position: relative;">
      <div style="padding: 12px 16px; background: rgba(15, 39, 68, 0.95); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
          <span style="font-weight: 700; font-size: 13px;">Peta Vektor Interaktif Wilayah Kabupaten Demak</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">14 Kecamatan • Klik Kecamatan untuk Filter</div>
      </div>
      <div style="flex: 1; padding: 16px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; align-content: start;" id="fallbackKecGrid">
        ${kecList.map(k => `
          <div onclick="window.onKecamatanSelected('${k.nama}')" class="fallback-kec-card" style="background: rgba(30, 58, 138, 0.35); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(59, 130, 246, 0.5)'" onmouseout="this.style.background='rgba(30, 58, 138, 0.35)'">
            <div style="font-weight: 700; font-size: 14px; color: #60a5fa; margin-bottom: 4px;">Kec. ${k.nama}</div>
            <div style="font-size: 11px; color: #cbd5e1;">Ibukota: ${k.ibu_kota}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Total: <b>${k.total_pekerjaan || 0}</b> Pekerjaan</div>
          </div>
        `).join('')}
      </div>
      <div style="padding: 8px 16px; background: #0b1329; font-size: 11px; color: #64748b; text-align: center;">
        Sistem Perencanaan Terintegrasi (SIREN) - DINPUTARU Kabupaten Demak
      </div>
    </div>
  `;
}

function updateFallbackMarkers(projects) {
  // Handled automatically through UI cards
}

// Global Exports
window.initGoogleMap = initGoogleMap;
window.renderKecamatanPolygons = renderKecamatanPolygons;
window.focusKecamatan = focusKecamatan;
window.resetMapToDemak = resetMapToDemak;
window.updateMapMarkers = updateMapMarkers;
window.focusProjectOnMap = focusProjectOnMap;

