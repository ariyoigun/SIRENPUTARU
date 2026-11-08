// public/js/map.js
// Interactive Map Module for SIREN Kabupaten Demak
// Integrates Google Maps API (AIzaSyCyhRYSklF6pnYBmtg2BJp4oCi_Ux3_Esg)
// High-performance smooth zoom (greedy scroll), multi-layer map types (Roadmap, Satellite, Terrain, Hybrid)
// and department-colored markers (Bina Marga: Blue, SDA BK: Green, Cipta Karya: Purple, Tata Ruang: Amber)

let googleMap = null;
let currentInfoWindow = null;
let kecamatanPolygons = [];
let projectMarkers = [];
let activePolygon = null;
let pendingProjectsList = [];

// Kabupaten Demak geographic center
const DEMAK_CENTER = { lat: -6.8944, lng: 110.6385 };

// Bidang Colors & Metadata
const BIDANG_META = {
  "Bina Marga": {
    color: "#2563eb", // Royal Blue
    label: "BM",
    namaLengkap: "Bidang Bina Marga (Jalan & Jembatan)"
  },
  "SDA BK": {
    color: "#059669", // Emerald Green
    label: "SDA",
    namaLengkap: "Bidang Sumber Daya Air & Bina Konstruksi"
  },
  "Cipta Karya": {
    color: "#7c3aed", // Violet / Purple
    label: "CK",
    namaLengkap: "Bidang Cipta Karya (Gedung & Sanitasi)"
  },
  "Tata Ruang": {
    color: "#d97706", // Amber / Gold
    label: "TR",
    namaLengkap: "Bidang Tata Ruang & Pertanahan"
  }
};

// Cached Pin Icons to prevent repeated SVG rendering
const PIN_ICONS_CACHE = {};

function getMarkerIcon(bidang) {
  const b = BIDANG_META[bidang] ? bidang : "Bina Marga";
  if (PIN_ICONS_CACHE[b]) return PIN_ICONS_CACHE[b];

  const meta = BIDANG_META[b];
  const color = meta.color;
  const label = meta.label;

  // Ultra-lightweight clean vector pin with high-contrast badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
    <ellipse cx="15" cy="36" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
    <path d="M15 1C7.82 1 2 6.82 2 14c0 10.2 13 22 13 22s13-11.8 13-22C28 6.82 22.18 1 15 1z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
    <circle cx="15" cy="13" r="8" fill="#ffffff"/>
    <text x="15" y="16.5" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="900" fill="${color}" text-anchor="middle">${label}</text>
  </svg>`;

  const iconObj = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(30, 38),
    anchor: new google.maps.Point(15, 36)
  };

  PIN_ICONS_CACHE[b] = iconObj;
  return iconObj;
}

// ==========================================
// 1. GOOGLE MAPS INITIALIZATION
// ==========================================
function initGoogleMap(containerId = 'googleMap') {
  const mapElement = document.getElementById(containerId);
  if (!mapElement) return;

  if (typeof google === 'undefined' || !google.maps) {
    console.warn("Google Maps API belum termuat. Menjalankan visualisasi fallback...");
    initFallbackVectorMap(containerId);
    return;
  }

  try {
    // Highly optimized Google Map settings
    googleMap = new google.maps.Map(mapElement, {
      center: DEMAK_CENTER,
      zoom: 11,
      minZoom: 9,
      maxZoom: 19,
      // SMOOTH SCROLL ZOOM: Direct mouse wheel zoom without pressing Ctrl key!
      gestureHandling: 'greedy',
      // Zoom in (+) and Zoom out (-) buttons visible on map
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      // MAP TYPES: Sediakan pilihan jenis peta Roadmap, Satellite, Terrain, Hybrid
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP,
          google.maps.MapTypeId.SATELLITE,
          google.maps.MapTypeId.HYBRID,
          google.maps.MapTypeId.TERRAIN
        ]
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    currentInfoWindow = new google.maps.InfoWindow();

    // Render Polygons for 14 Kecamatan
    renderKecamatanPolygons();

    // Close InfoWindow on empty map click
    googleMap.addListener('click', () => {
      if (currentInfoWindow) currentInfoWindow.close();
    });

    // RENDER MARKERS IMMEDIATELY IF DATA IS ALREADY LOADED!
    const initialProjects = (pendingProjectsList && pendingProjectsList.length > 0)
      ? pendingProjectsList
      : (window.SIREN_DATA && window.SIREN_DATA.pekerjaan ? window.SIREN_DATA.pekerjaan : []);

    if (initialProjects && initialProjects.length > 0) {
      console.log(`[Google Maps] Rendering initial ${initialProjects.length} markers...`);
      updateMapMarkers(initialProjects);
    }

    console.log("[Google Maps] Inisialisasi peta Demak berhasil (Greedy Zoom & Multi-Layer Aktif).");
  } catch (err) {
    console.error("Gagal menginisialisasi Google Maps:", err);
    initFallbackVectorMap(containerId);
  }
}

// ==========================================
// 2. KECAMATAN POLYGONS (14 KECAMATAN)
// ==========================================
function renderKecamatanPolygons() {
  if (!googleMap || !window.SIREN_DATA || !window.SIREN_DATA.kecamatan) return;

  // Clear existing polygons
  kecamatanPolygons.forEach(p => p.setMap(null));
  kecamatanPolygons = [];

  const kecamatanList = window.SIREN_DATA.kecamatan;

  kecamatanList.forEach(kec => {
    if (!kec.polygon || !kec.polygon.length) return;

    const path = kec.polygon.map(coord => ({ lat: Number(coord[0]), lng: Number(coord[1]) }));

    const polygon = new google.maps.Polygon({
      paths: path,
      strokeColor: kec.warna || "#1e40af",
      strokeOpacity: 0.75,
      strokeWeight: 1.5,
      fillColor: kec.warna || "#3b82f6",
      fillOpacity: 0.12,
      map: googleMap,
      zIndex: 1
    });

    polygon.kecamatanData = kec;

    // Click handler to select and filter kecamatan
    polygon.addListener('click', () => {
      focusKecamatan(kec.nama, polygon);
    });

    kecamatanPolygons.push(polygon);
  });
}

// Focus on a specific Kecamatan and highlight its boundary
function focusKecamatan(namaKecamatan, polygonObj = null) {
  if (!namaKecamatan) return;

  const kec = window.SIREN_DATA.kecamatan.find(k => k.nama.toLowerCase() === namaKecamatan.toLowerCase());
  if (!kec) return;

  // Reset previously active polygon
  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.12,
      strokeWeight: 1.5,
      strokeColor: activePolygon.kecamatanData.warna || "#1e40af"
    });
  }

  // Find or set active polygon
  if (polygonObj) {
    activePolygon = polygonObj;
  } else {
    activePolygon = kecamatanPolygons.find(p => p.kecamatanData && p.kecamatanData.nama.toLowerCase() === namaKecamatan.toLowerCase());
  }

  // Highlight selected polygon
  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.35,
      strokeWeight: 3.5,
      strokeColor: '#f59e0b' // Gold / Amber border
    });
  }

  // Center and Zoom Map to this Kecamatan smoothly
  if (googleMap) {
    googleMap.panTo({ lat: Number(kec.lat), lng: Number(kec.lng) });
    googleMap.setZoom(12);
  }

  // Trigger app.js filter
  if (typeof window.onKecamatanSelected === 'function') {
    window.onKecamatanSelected(kec.nama);
  }
}

// Reset Map view back to whole Demak
function resetMapToDemak() {
  if (activePolygon) {
    activePolygon.setOptions({
      fillOpacity: 0.12,
      strokeWeight: 1.5,
      strokeColor: activePolygon.kecamatanData.warna || "#1e40af"
    });
    activePolygon = null;
  }

  if (googleMap) {
    googleMap.panTo(DEMAK_CENTER);
    googleMap.setZoom(11);
  }

  if (typeof window.onKecamatanReset === 'function') {
    window.onKecamatanReset();
  }
}

// ==========================================
// 3. PROJECT MARKER PINS (FAST & COLOR-CODED)
// ==========================================
function updateMapMarkers(projects) {
  // Save to pending list in case googleMap is still loading
  pendingProjectsList = projects || [];

  if (!googleMap) {
    // If fallback map is active, update fallback view
    updateFallbackMarkers(projects);
    return;
  }

  // Clear existing markers
  projectMarkers.forEach(m => m.setMap(null));
  projectMarkers = [];

  if (!projects || !projects.length) return;

  // Fast marker rendering without animation freeze
  projects.forEach((proj, index) => {
    if (!proj.lat || !proj.lng) return;

    const latNum = Number(proj.lat);
    const lngNum = Number(proj.lng);
    if (isNaN(latNum) || isNaN(lngNum)) return;

    const icon = getMarkerIcon(proj.bidang);

    const marker = new google.maps.Marker({
      position: { lat: latNum, lng: lngNum },
      map: googleMap,
      title: `${proj.nama_pekerjaan} (${proj.bidang})`,
      icon: icon,
      // NO DROP ANIMATION TO PREVENT JANK / FREEZING
      zIndex: 100 + index
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
    yearBudgetInfo = `
      <div style="margin-top: 6px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px; font-size: 11px; color: #1e40af;">
        Alokasi TA ${activeYear}: <b>${yVal}</b>
      </div>
    `;
  }

  const content = `
    <div style="max-width: 310px; font-family: 'Inter', system-ui, sans-serif; padding: 4px; color: #0f172a;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="background: ${meta.color}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
          ${proj.bidang}
        </span>
        <span style="font-size: 11px; color: #64748b; font-weight: 700;">
          Prioritas ${proj.prioritas || 2}
        </span>
      </div>
      <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.35;">
        ${proj.nama_pekerjaan}
      </h4>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; line-height: 1.4;">
        <b>Kecamatan:</b> <span style="color: #0f172a; font-weight: 600;">${proj.kecamatan || '-'}</span><br>
        <b>Ruas / Lokasi:</b> <span style="color: #0f172a; font-weight: 500;">${proj.ruas || '-'}</span>
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; font-size: 11px;">
        <span style="color: #64748b; font-size: 10px; font-weight: 600; text-transform: uppercase;">Total Kebutuhan Anggaran:</span><br>
        <b style="color: #1e40af; font-size: 13px; font-family: monospace;">${formattedBudget}</b>
      </div>
      ${yearBudgetInfo}
      <button onclick="window.viewProjectDetail('${proj.id}')" style="margin-top: 8px; width: 100%; background: #2563eb; color: #ffffff; border: none; padding: 7px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
        Lihat Detail Perencanaan &rarr;
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
// 4. FALLBACK VECTOR MAP (IF OFFLINE)
// ==========================================
function initFallbackVectorMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const kecList = window.SIREN_DATA ? window.SIREN_DATA.kecamatan : [];

  container.innerHTML = `
    <div style="width: 100%; height: 100%; background: #f8fafc; color: #0f172a; display: flex; flex-direction: column; border-radius: 1rem; overflow: hidden; position: relative; border: 1px solid #e2e8f0;">
      <div style="padding: 12px 16px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #2563eb;"></span>
          <span style="font-weight: 700; font-size: 13px; color: #0f172a;">Peta Perencanaan Wilayah Kabupaten Demak</span>
        </div>
        <div style="font-size: 11px; color: #64748b;">14 Kecamatan • Klik untuk Filter</div>
      </div>
      <div style="flex: 1; padding: 16px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; align-content: start;">
        ${kecList.map(k => `
          <div onclick="window.onKecamatanSelected('${k.nama}')" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#2563eb'; this.style.backgroundColor='#eff6ff'" onmouseout="this.style.borderColor='#cbd5e1'; this.style.backgroundColor='#ffffff'">
            <div style="font-weight: 800; font-size: 13px; color: #1e3a8a; margin-bottom: 4px;">Kec. ${k.nama}</div>
            <div style="font-size: 11px; color: #64748b;">Ibukota: ${k.ibu_kota}</div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 600; margin-top: 6px;">Luas: ${k.luas_km2} km²</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function updateFallbackMarkers(projects) {
  // Fallback cards handle selection
}

// Global Exports
window.initGoogleMap = initGoogleMap;
window.renderKecamatanPolygons = renderKecamatanPolygons;
window.focusKecamatan = focusKecamatan;
window.resetMapToDemak = resetMapToDemak;
window.updateMapMarkers = updateMapMarkers;
window.focusProjectOnMap = focusProjectOnMap;
