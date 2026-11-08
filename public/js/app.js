// public/js/app.js
// Client Application Logic for SIREN Kabupaten Demak
// Sistem Perencanaan Terintegrasi Dinas Pekerjaan Umum dan Penataan Ruang

// Global App State
const state = {
  token: localStorage.getItem('siren_token') || null,
  user: JSON.parse(localStorage.getItem('siren_user') || 'null'),
  cms: {},
  kecamatan: [],
  pekerjaan: [],
  activeYears: ['2027', '2028', '2029', '2030', '2031'],
  stats: null,
  activeView: 'public', // 'public', 'dashboard', 'pekerjaan', 'map', 'users', 'cms', 'tahun', 'database'
  filters: {
    kecamatan: 'all',
    tahun: 'all',
    bidang: 'all',
    search: '',
    prioritas: 'all'
  },
  sortBy: 'default',
  sortColumn: null,
  sortAsc: true,
  captcha: null,
  editingItem: null,
  editingUser: null,
  charts: {}
};

// Window globals for map callbacks
window.SIREN_DATA = {
  kecamatan: [],
  pekerjaan: []
};
window.currentYearFilter = 'all';

// Configure Chart.js defaults for Light Theme with dark legible text
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#334155'; // Dark slate
  Chart.defaults.borderColor = '#e2e8f0'; // Light slate border
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
}

// ==========================================
// 1. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("SIREN App Initializing...");
  setupEventListeners();
  await loadCmsTexts();
  await loadKecamatan();
  await loadTahunList();
  await loadPekerjaan();
  await loadStats();

  // Check existing session
  if (state.token) {
    verifySession();
  } else {
    showPublicPortal();
  }

  // Initialize Map
  if (typeof window.initGoogleMap === 'function') {
    window.initGoogleMap('googleMap');
  }

  // Load CAPTCHA ready for login
  loadCaptcha();
});

// Setup DOM event listeners
function setupEventListeners() {
  const publicSearch = document.getElementById('publicSearch');
  if (publicSearch) {
    publicSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      renderPublicTable();
    });
  }

  const internalSearch = document.getElementById('internalSearch');
  if (internalSearch) {
    internalSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      renderInternalTable();
    });
  }
}

// ==========================================
// 2. DATA FETCHING
// ==========================================
async function loadCmsTexts() {
  try {
    const res = await fetch('/api/cms');
    const json = await res.json();
    if (json.success) {
      state.cms = json.data;
      applyCmsTexts();
    }
  } catch (err) {
    console.error("Gagal memuat teks CMS:", err);
  }
}

function applyCmsTexts() {
  const c = state.cms;
  if (!c) return;

  // Header & Brand
  document.querySelectorAll('.cms-site-title').forEach(el => el.textContent = c.site_title || 'SIREN');
  document.querySelectorAll('.cms-site-fullname').forEach(el => el.textContent = c.site_full_name || 'Sistem Perencanaan Terintegrasi');
  document.querySelectorAll('.cms-site-tagline').forEach(el => el.textContent = c.site_tagline || 'Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak');
  document.querySelectorAll('.cms-site-badge').forEach(el => el.textContent = c.site_badge || 'Terpadu & Akuntabel');

  // Hero Section
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = c.hero_title || 'Sistem Perencanaan Pembangunan Terintegrasi';

  const heroSubtitle = document.getElementById('heroSubtitle');
  if (heroSubtitle) heroSubtitle.textContent = c.hero_subtitle || 'Peta Interaktif Sebaran Pekerjaan Bidang Bina Marga, SDA BK, Cipta Karya, dan Tata Ruang';

  const heroWelcome = document.getElementById('heroWelcome');
  if (heroWelcome) heroWelcome.textContent = c.hero_welcome || 'Selamat Datang di SIREN DINPUTARU Kabupaten Demak';

  const heroDescription = document.getElementById('heroDescription');
  if (heroDescription) heroDescription.textContent = c.hero_description || '';

  // Map Section
  const mapTitle = document.getElementById('mapTitle');
  if (mapTitle) mapTitle.textContent = c.map_title || 'Peta Interaktif Perencanaan Wilayah Demak';

  const mapSubtitle = document.getElementById('mapSubtitle');
  if (mapSubtitle) mapSubtitle.textContent = c.map_subtitle || 'Klik pada batas kecamatan di peta untuk memfokuskan wilayah dan menampilkan pin titik pekerjaan.';

  // Table Section
  const tableTitle = document.getElementById('tableTitle');
  if (tableTitle) tableTitle.textContent = c.table_title || 'Daftar Rincian Pekerjaan Terencana';

  const tableSubtitle = document.getElementById('tableSubtitle');
  if (tableSubtitle) tableSubtitle.textContent = c.table_subtitle || '';

  // Footer Contacts
  const footerAddress = document.getElementById('footerAddress');
  if (footerAddress) footerAddress.textContent = c.footer_address || '';

  const footerPhone = document.getElementById('footerPhone');
  if (footerPhone) footerPhone.textContent = c.footer_phone || '';

  const footerEmail = document.getElementById('footerEmail');
  if (footerEmail) footerEmail.textContent = c.footer_email || '';

  const footerHours = document.getElementById('footerHours');
  if (footerHours) footerHours.textContent = c.footer_hours || '';

  const footerCopyright = document.getElementById('footerCopyright');
  if (footerCopyright) footerCopyright.textContent = c.footer_copyright || '';
}

async function loadKecamatan() {
  try {
    const res = await fetch('/api/kecamatan');
    const json = await res.json();
    if (json.success) {
      state.kecamatan = json.data;
      window.SIREN_DATA.kecamatan = json.data;
      populateKecamatanDropdowns();
    }
  } catch (err) {
    console.error("Gagal memuat data kecamatan:", err);
  }
}

function populateKecamatanDropdowns() {
  const options = `<option value="all">Semua Kecamatan (14)</option>` +
    state.kecamatan.map(k => `<option value="${k.nama}">Kecamatan ${k.nama}</option>`).join('');

  // Modal Kecamatan Select
  const modalSelect = document.getElementById('modalKecamatanSelect');
  if (modalSelect) {
    modalSelect.innerHTML = `<option value="">-- Pilih Kecamatan --</option>` +
      state.kecamatan.map(k => `<option value="${k.nama}">Kecamatan ${k.nama}</option>`).join('');
  }

  // Dashboard Tab 1 Kecamatan Filter
  const internalFilter = document.getElementById('internalFilterKecamatan');
  if (internalFilter) internalFilter.innerHTML = options;

  // Tab 2 Pekerjaan Kecamatan Filter
  const tabFilter = document.getElementById('tabPekerjaanKecamatanSelect');
  if (tabFilter) tabFilter.innerHTML = options;
}

// Dynamic Year Management
async function loadTahunList() {
  try {
    const res = await fetch('/api/tahun');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      state.activeYears = json.data;
      renderYearFilterPills();
      renderModalYearFields();
      renderTahunManagementPane();
    }
  } catch (err) {
    console.error("Gagal memuat daftar tahun:", err);
  }
}

function renderYearFilterPills() {
  // Public Year Pills
  const container = document.getElementById('publicYearPillsContainer');
  if (container) {
    const activeY = state.filters.tahun;
    let html = `
      <button onclick="setYearFilter('all')" data-year="all" class="year-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeY === 'all' ? 'bg-blue-900 text-white shadow-sm border border-blue-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
        Semua
      </button>
    `;
    state.activeYears.forEach(y => {
      const isAct = activeY === y;
      html += `
        <button onclick="setYearFilter('${y}')" data-year="${y}" class="year-pill px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${isAct ? 'bg-blue-900 text-white shadow-sm border border-blue-700 font-bold' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
          ${y}
        </button>
      `;
    });
    container.innerHTML = html;
  }

  // Dropdown options for Internal filters (Tab 1 & Tab 2)
  let yearOptions = `<option value="all">Semua Tahun</option>`;
  state.activeYears.forEach(y => {
    yearOptions += `<option value="${y}" ${state.filters.tahun === y ? 'selected' : ''}>Tahun ${y}</option>`;
  });

  const internalYearSelect = document.getElementById('internalFilterTahun');
  if (internalYearSelect) internalYearSelect.innerHTML = yearOptions;

  const tabYearSelect = document.getElementById('tabPekerjaanYearSelect');
  if (tabYearSelect) tabYearSelect.innerHTML = yearOptions;
}

function renderModalYearFields(item = null) {
  const container = document.getElementById('modalDynamicYearsContainer');
  if (!container) return;

  const years = state.activeYears && state.activeYears.length > 0 ? state.activeYears : ['2027', '2028', '2029', '2030', '2031'];
  
  container.innerHTML = years.map(yr => {
    const val = (item && item.anggaran_tahun && item.anggaran_tahun[yr]) ? item.anggaran_tahun[yr] : 0;
    return `
      <div>
        <span class="text-[10px] text-slate-600 font-bold block mb-0.5">TA ${yr}</span>
        <input type="number" id="modalY_${yr}" data-year="${yr}" placeholder="0" value="${val}" class="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:ring-1 focus:ring-blue-600">
      </div>
    `;
  }).join('');
}

function renderTahunManagementPane() {
  const container = document.getElementById('tahunListContainer');
  const badgeTotal = document.getElementById('badgeTotalTahun');
  if (badgeTotal) badgeTotal.textContent = `${state.activeYears.length} Tahun Aktif`;

  if (!container) return;

  container.innerHTML = state.activeYears.map(yr => {
    // Count projects having budget in this year
    let countInYr = 0;
    let budgetInYr = 0;
    state.pekerjaan.forEach(p => {
      const b = (p.anggaran_tahun && p.anggaran_tahun[yr]) || 0;
      if (b > 0) {
        countInYr++;
        budgetInYr += b;
      }
    });

    const budgetM = (budgetInYr / 1e9).toFixed(1);

    return `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-base font-extrabold text-blue-900 tracking-tight">Tahun ${yr}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Aktif
          </span>
        </div>
        <div class="space-y-1 mb-4 text-xs text-slate-600">
          <div class="flex justify-between">
            <span>Paket Terencana:</span>
            <span class="font-bold text-slate-900">${countInYr} Paket</span>
          </div>
          <div class="flex justify-between">
            <span>Total Alokasi:</span>
            <span class="font-bold text-emerald-700 font-mono">Rp ${budgetM} M</span>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-200 flex justify-end">
          <button onclick="confirmDeleteTahun('${yr}')" ${state.activeYears.length <= 1 ? 'disabled title="Minimal 1 tahun harus ada"' : ''} class="px-2.5 py-1 text-xs text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-200 font-semibold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Hapus
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleAddTahun(e) {
  e.preventDefault();
  const input = document.getElementById('newTahunInput');
  if (!input) return;
  const yr = String(input.value).trim();

  if (!/^\d{4}$/.test(yr)) {
    alert('Masukkan format 4 angka tahun yang valid (contoh: 2032).');
    return;
  }

  try {
    const res = await fetch('/api/tahun', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ tahun: yr })
    });
    const json = await res.json();
    if (json.success) {
      alert(json.message);
      input.value = '';
      await loadTahunList();
      await loadStats();
      renderInternalInfographics();
    } else {
      alert(json.message || 'Gagal menambahkan tahun.');
    }
  } catch (err) {
    console.error("Add year error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

async function confirmDeleteTahun(year) {
  if (!confirm(`Apakah Anda yakin ingin menghapus tahun anggaran ${year} dari sistem perencanaan?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/tahun/${year}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    const json = await res.json();
    if (json.success) {
      alert(json.message);
      if (state.filters.tahun === year) state.filters.tahun = 'all';
      await loadTahunList();
      await loadStats();
      renderInternalInfographics();
      renderInternalTable();
    } else {
      alert(json.message || 'Gagal menghapus tahun.');
    }
  } catch (err) {
    console.error("Delete year error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

async function loadPekerjaan() {
  try {
    const res = await fetch('/api/pekerjaan');
    const json = await res.json();
    if (json.success) {
      state.pekerjaan = json.data;
      window.SIREN_DATA.pekerjaan = json.data;
      applyFiltersAndRefreshMap();
      renderPublicTable();
      renderInternalTable();
    }
  } catch (err) {
    console.error("Gagal memuat pekerjaan:", err);
  }
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (json.success) {
      state.stats = json.data;
      updateStatCards();
      if (state.activeView === 'dashboard') {
        renderInternalInfographics();
      }
    }
  } catch (err) {
    console.error("Gagal memuat statistik:", err);
  }
}

function updateStatCards() {
  const s = state.stats;
  if (!s) return;

  const totalPaketEl = document.getElementById('statTotalPekerjaan');
  if (totalPaketEl) totalPaketEl.textContent = `${s.ringkasan.total_pekerjaan} Paket`;

  const totalAnggaranEl = document.getElementById('statTotalAnggaran');
  if (totalAnggaranEl) {
    const totalTriliun = (s.ringkasan.total_anggaran / 1e12).toFixed(2);
    totalAnggaranEl.textContent = `Rp ${totalTriliun.replace('.', ',')} T`;
  }
}

// ==========================================
// 3. FILTERING & SORTING LOGIC
// ==========================================
function setYearFilter(yr) {
  setTahunFilter(yr);
}

function setTahunFilter(tahun) {
  state.filters.tahun = tahun;
  window.currentYearFilter = tahun;
  renderYearFilterPills();
  applyFiltersAndRefreshMap();
}

function setBidangFilter(bidang) {
  state.filters.bidang = bidang;

  document.querySelectorAll('.bidang-pill').forEach(btn => {
    if (btn.getAttribute('data-bidang') === bidang) {
      btn.classList.add('ring-2', 'ring-blue-600', 'font-bold');
    } else {
      btn.classList.remove('ring-2', 'ring-blue-600', 'font-bold');
    }
  });

  applyFiltersAndRefreshMap();
}

function setKecamatanFilter(kecName) {
  state.filters.kecamatan = kecName;

  // Update dropdown value
  const sel = document.getElementById('publicKecamatanSelect');
  if (sel) {
    if (kecName === 'all') {
      sel.value = 'all';
    } else {
      const match = state.kecamatan.find(k => k.nama.toLowerCase() === kecName.toLowerCase());
      if (match) sel.value = match.id;
    }
  }

  // Update selected kecamatan banner
  const banner = document.getElementById('selectedKecamatanBanner');
  if (banner) {
    if (kecName === 'all') {
      banner.classList.add('hidden');
    } else {
      const kData = state.kecamatan.find(k => k.nama.toLowerCase() === kecName.toLowerCase());
      const titleEl = document.getElementById('selectedKecamatanTitle');
      const descEl = document.getElementById('selectedKecamatanDesc');
      const paketEl = document.getElementById('selectedKecamatanTotalPaket');
      const budgetEl = document.getElementById('selectedKecamatanTotalBudget');

      if (titleEl) titleEl.textContent = `Kecamatan ${kecName}`;
      if (descEl && kData) {
        descEl.textContent = `Ibukota: ${kData.ibu_kota || '-'} • Luas: ${kData.luas_km2} km² • ${kData.jumlah_desa} Desa. ${kData.deskripsi || ''}`;
      }

      // Calculate totals for this kecamatan
      const subProjects = state.pekerjaan.filter(p => (p.kecamatan || '').toLowerCase() === kecName.toLowerCase());
      const totalBudget = subProjects.reduce((acc, p) => acc + (p.kebutuhan_anggaran || 0), 0);
      const budgetM = (totalBudget / 1e9).toFixed(1);

      if (paketEl) paketEl.textContent = `${subProjects.length} Paket`;
      if (budgetEl) budgetEl.textContent = `Rp ${budgetM} M`;

      banner.classList.remove('hidden');
    }
  }

  // If map exists, trigger polygon focus
  if (kecName !== 'all') {
    if (typeof window.focusKecamatan === 'function') {
      window.focusKecamatan(kecName);
    }
  } else {
    if (typeof window.resetMapToDemak === 'function') {
      window.resetMapToDemak();
    }
  }

  applyFiltersAndRefreshMap();
}

function onKecamatanSelectChange(val) {
  if (val === 'all') {
    resetKecamatanFilter();
  } else {
    const k = state.kecamatan.find(item => item.id.toLowerCase() === val.toLowerCase() || item.nama.toLowerCase() === val.toLowerCase());
    const name = k ? k.nama : val;
    setKecamatanFilter(name);
  }
}

function resetKecamatanFilter() {
  setKecamatanFilter('all');
}

// Sorting & Filtering Handlers for Internal Dashboard
function handleBidangFilterChange(bidang) {
  state.filters.bidang = bidang;
  syncFilterControls();
  renderInternalTable();
}

function handleTahunFilterChange(tahun) {
  state.filters.tahun = tahun;
  syncFilterControls();
  renderInternalTable();
}

function handleKecamatanFilterChange(kecamatan) {
  state.filters.kecamatan = kecamatan;
  syncFilterControls();
  renderInternalTable();
}

function handleInternalSearch(val) {
  state.filters.search = val;
  const s1 = document.getElementById('internalSearch');
  const s2 = document.getElementById('tabPekerjaanSearch');
  if (s1 && s1.value !== val) s1.value = val;
  if (s2 && s2.value !== val) s2.value = val;
  syncFilterControls();
  renderInternalTable();
}

function resetAllInternalFilters() {
  state.filters.kecamatan = 'all';
  state.filters.tahun = 'all';
  state.filters.bidang = 'all';
  state.filters.search = '';
  state.filters.prioritas = 'all';
  state.sortBy = 'default';
  state.sortColumn = null;

  const s1 = document.getElementById('internalSearch');
  if (s1) s1.value = '';
  const s2 = document.getElementById('tabPekerjaanSearch');
  if (s2) s2.value = '';

  syncFilterControls();
  renderInternalTable();
}

function syncFilterControls() {
  const setSelectVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setSelectVal('internalFilterBidang', state.filters.bidang);
  setSelectVal('tabPekerjaanBidangSelect', state.filters.bidang);

  setSelectVal('internalFilterTahun', state.filters.tahun);
  setSelectVal('tabPekerjaanYearSelect', state.filters.tahun);

  setSelectVal('internalFilterKecamatan', state.filters.kecamatan);
  setSelectVal('tabPekerjaanKecamatanSelect', state.filters.kecamatan);

  setSelectVal('internalSortSelect', state.sortBy);

  // Update status indicator
  const statusEl = document.getElementById('infographicFilterStatus');
  if (statusEl) {
    const parts = [];
    if (state.filters.kecamatan !== 'all') parts.push(`Kecamatan: <b class="text-blue-900">${state.filters.kecamatan}</b>`);
    if (state.filters.tahun !== 'all') parts.push(`Tahun: <b class="text-blue-900">${state.filters.tahun}</b>`);
    if (state.filters.bidang !== 'all') parts.push(`Bidang: <b class="text-blue-900">${state.filters.bidang}</b>`);
    if (state.filters.search) parts.push(`Cari: "<b>${state.filters.search}</b>"`);

    if (parts.length > 0) {
      statusEl.innerHTML = `Filter Aktif: ${parts.join(' • ')} <button onclick="resetAllInternalFilters()" class="ml-2 text-rose-600 underline font-bold text-xs">Reset Semua</button>`;
    } else {
      statusEl.innerHTML = `Menampilkan seluruh data tanpa filter.`;
    }
  }
}

function handleSortChange(val) {
  state.sortBy = val;
  syncFilterControls();
  renderInternalTable();
}

function handleSortColumn(col) {
  if (state.sortColumn === col) {
    state.sortAsc = !state.sortAsc;
  } else {
    state.sortColumn = col;
    state.sortAsc = true;
  }
  state.sortBy = 'column';
  syncFilterControls();
  renderInternalTable();
}

function getFilteredProjects() {
  let list = state.pekerjaan.filter(p => {
    // Kecamatan filter
    if (state.filters.kecamatan !== 'all') {
      const kFilter = state.filters.kecamatan.toLowerCase();
      const pKec = (p.kecamatan || '').toLowerCase();
      if (!pKec.includes(kFilter)) return false;
    }

    // Tahun filter
    if (state.filters.tahun !== 'all') {
      const yr = state.filters.tahun;
      const budgetInYear = p.anggaran_tahun ? p.anggaran_tahun[yr] : 0;
      if (!budgetInYear || budgetInYear <= 0) return false;
    }

    // Bidang filter
    if (state.filters.bidang !== 'all') {
      const bFilter = state.filters.bidang.toLowerCase();
      const pBidang = (p.bidang || '').toLowerCase();
      if (!pBidang.includes(bFilter)) return false;
    }

    // Search filter
    if (state.filters.search && state.filters.search.trim() !== '') {
      const q = state.filters.search.toLowerCase().trim();
      const matches = (p.nama_pekerjaan || '').toLowerCase().includes(q) ||
        (p.ruas || '').toLowerCase().includes(q) ||
        (p.kecamatan || '').toLowerCase().includes(q) ||
        (p.bidang || '').toLowerCase().includes(q) ||
        (p.sub_bidang || '').toLowerCase().includes(q) ||
        (p.keterangan || '').toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Prioritas filter
    if (state.filters.prioritas !== 'all') {
      if (String(p.prioritas) !== String(state.filters.prioritas)) return false;
    }

    return true;
  });

  return applySort(list);
}

function applySort(list) {
  const sorted = [...list];
  const sortMode = state.sortBy || 'default';

  if (sortMode === 'tahun-asc') {
    sorted.sort((a, b) => getEarliestYear(a) - getEarliestYear(b));
  } else if (sortMode === 'tahun-desc') {
    sorted.sort((a, b) => getEarliestYear(b) - getEarliestYear(a));
  } else if (sortMode === 'kecamatan-asc') {
    sorted.sort((a, b) => (a.kecamatan || '').localeCompare(b.kecamatan || ''));
  } else if (sortMode === 'bidang-asc') {
    sorted.sort((a, b) => (a.bidang || '').localeCompare(b.bidang || ''));
  } else if (sortMode === 'anggaran-desc') {
    sorted.sort((a, b) => (b.kebutuhan_anggaran || 0) - (a.kebutuhan_anggaran || 0));
  } else if (sortMode === 'anggaran-asc') {
    sorted.sort((a, b) => (a.kebutuhan_anggaran || 0) - (b.kebutuhan_anggaran || 0));
  } else if (sortMode === 'prioritas-asc') {
    sorted.sort((a, b) => (a.prioritas || 2) - (b.prioritas || 2));
  } else if (sortMode === 'column' && state.sortColumn) {
    const col = state.sortColumn;
    const dir = state.sortAsc ? 1 : -1;
    sorted.sort((a, b) => {
      let valA = a[col] !== undefined ? a[col] : '';
      let valB = b[col] !== undefined ? b[col] : '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  return sorted;
}

function getEarliestYear(item) {
  if (!item.anggaran_tahun) return 9999;
  const years = Object.keys(item.anggaran_tahun)
    .filter(y => (item.anggaran_tahun[y] || 0) > 0)
    .map(y => parseInt(y, 10))
    .sort((a, b) => a - b);
  return years.length > 0 ? years[0] : 9999;
}

function applyFiltersAndRefreshMap() {
  const filtered = getFilteredProjects();

  // Update map marker pins
  if (typeof window.updateMapMarkers === 'function') {
    window.updateMapMarkers(filtered);
  }

  // Update label indicator
  const mapFilterStatus = document.getElementById('mapFilterStatus');
  if (mapFilterStatus) {
    const kecText = state.filters.kecamatan === 'all' ? 'Seluruh Demak' : `Kecamatan ${state.filters.kecamatan}`;
    const yrText = state.filters.tahun === 'all' ? 'Semua Tahun' : `Tahun ${state.filters.tahun}`;
    const bdText = state.filters.bidang === 'all' ? 'Semua Bidang' : state.filters.bidang;
    mapFilterStatus.innerHTML = `Menampilkan: <span class="font-bold text-sky-300">${kecText}</span> • <span class="font-bold text-amber-300">${yrText}</span> • <span class="font-bold text-emerald-300">${bdText}</span> (<span class="font-bold text-white">${filtered.length} Titik</span>)`;
  }

  // Render Table & Cards below map
  renderPublicTable(filtered);

  // If in internal view, update internal table
  if (state.activeView === 'pekerjaan' || state.activeView === 'dashboard') {
    renderInternalTable(filtered);
  }
}

// Callback when user clicks polygon in map.js
window.onKecamatanSelected = (namaKecamatan) => {
  setKecamatanFilter(namaKecamatan);
  const tableSection = document.getElementById('tableSection');
  if (tableSection) {
    tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.onKecamatanReset = () => {
  resetKecamatanFilter();
};

// ==========================================
// 4. PUBLIC TABLE RENDERING
// ==========================================
function renderPublicTable(filteredList = null) {
  const list = filteredList || getFilteredProjects();
  const tbody = document.getElementById('publicTableBody');
  const countShowing = document.getElementById('tableShowingCount');
  const countTotal = document.getElementById('tableTotalCount');

  if (countShowing) countShowing.textContent = list.length;
  if (countTotal) countTotal.textContent = state.pekerjaan.length;

  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-10 text-slate-500">
          <div class="flex flex-col items-center justify-center gap-2">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="font-semibold text-sm text-slate-600">Tidak ada paket pekerjaan ditemukan untuk kriteria filter ini.</p>
            <p class="text-xs text-slate-400">Silakan ubah filter kecamatan, bidang, atau tahun anggaran di atas.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    let badgeClass = "badge-bm";
    let borderClass = "bidang-bina-marga";
    if (item.bidang === "SDA BK") {
      badgeClass = "badge-sda";
      borderClass = "bidang-sda-bk";
    } else if (item.bidang === "Cipta Karya") {
      badgeClass = "badge-ck";
      borderClass = "bidang-cipta-karya";
    } else if (item.bidang === "Tata Ruang") {
      badgeClass = "badge-trp";
      borderClass = "bidang-tata-ruang";
    }

    const budgetFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.kebutuhan_anggaran || 0);

    const activeYearsWithBudget = [];
    if (item.anggaran_tahun) {
      Object.keys(item.anggaran_tahun).forEach(y => {
        if (item.anggaran_tahun[y] > 0) activeYearsWithBudget.push(y);
      });
    }
    const yearsDisplay = activeYearsWithBudget.length > 0 ? activeYearsWithBudget.join(', ') : '-';

    return `
      <tr class="${borderClass} hover:bg-slate-50 transition-colors">
        <td class="text-center font-mono text-slate-400 text-xs">${idx + 1}</td>
        <td>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
            ${item.bidang}
          </span>
          <div class="text-[11px] text-slate-500 mt-0.5">${item.sub_bidang || '-'}</div>
        </td>
        <td>
          <div class="font-bold text-slate-900 text-sm">${item.nama_pekerjaan}</div>
          <div class="text-xs text-slate-500 mt-0.5">Ruas / Lokasi: <span class="font-medium text-slate-700">${item.ruas || '-'}</span></div>
        </td>
        <td>
          <span class="font-semibold text-slate-800 text-xs">${item.kecamatan}</span>
        </td>
        <td class="text-center">
          <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold ${item.prioritas === 1 ? 'bg-rose-100 text-rose-700' : (item.prioritas === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}">
            P-${item.prioritas || 2}
          </span>
        </td>
        <td>
          <span class="font-mono font-bold text-blue-900 text-xs">${budgetFormatted}</span>
        </td>
        <td class="text-center font-mono text-xs font-semibold text-slate-700">
          ${yearsDisplay}
        </td>
        <td class="text-center">
          <button onclick="viewProjectDetail('${item.id}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200">
            Detail
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Project Detail Modal Viewer
function viewProjectDetail(id) {
  const item = state.pekerjaan.find(p => p.id === id);
  if (!item) return;

  const modal = document.getElementById('projectDetailModal');
  const titleEl = document.getElementById('modalDetailTitle');
  const bodyEl = document.getElementById('modalDetailBody');

  if (titleEl) titleEl.textContent = item.nama_pekerjaan;

  let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  if (item.bidang === "SDA BK") badgeColor = "bg-teal-100 text-teal-800 border-teal-200";
  else if (item.bidang === "Cipta Karya") badgeColor = "bg-purple-100 text-purple-800 border-purple-200";
  else if (item.bidang === "Tata Ruang") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";

  const budgetTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.kebutuhan_anggaran || 0);

  let yearsBreakdown = '';
  if (item.anggaran_tahun) {
    yearsBreakdown = Object.keys(item.anggaran_tahun).map(yr => {
      const val = item.anggaran_tahun[yr] || 0;
      const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
      return `
        <div class="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
          <span class="text-slate-600 font-medium">Tahun Anggaran ${yr}:</span>
          <span class="font-mono font-bold ${val > 0 ? 'text-blue-900' : 'text-slate-400'}">${fmt}</span>
        </div>
      `;
    }).join('');
  }

  bodyEl.innerHTML = `
    <div class="space-y-4 text-xs text-slate-700">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full font-bold border ${badgeColor}">
          ${item.bidang}
        </span>
        <span class="text-slate-500 font-semibold">• Sub-Bidang: ${item.sub_bidang || '-'}</span>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <span class="text-[11px] text-slate-500 block">Kecamatan:</span>
          <span class="font-bold text-slate-900">${item.kecamatan}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Ruas / Lokasi:</span>
          <span class="font-bold text-slate-900">${item.ruas || '-'}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Panjang Total:</span>
          <span class="font-bold text-slate-900 font-mono">${item.panjang_total_km ? item.panjang_total_km + ' Km' : (item.panjang_m ? item.panjang_m + ' m' : '-')}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Tingkat Prioritas:</span>
          <span class="font-bold text-blue-800">Prioritas ${item.prioritas || 2}</span>
        </div>
      </div>

      <div class="p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
        <span class="text-[11px] text-blue-950 font-bold block mb-1">Total Kebutuhan Anggaran:</span>
        <div class="text-xl font-extrabold text-blue-900 font-mono">${budgetTotal}</div>
      </div>

      <div>
        <h5 class="font-bold text-slate-900 mb-2">Rincian Alokasi Multi-Tahun</h5>
        <div class="bg-white border border-slate-200 rounded-2xl p-3">
          ${yearsBreakdown || '<p class="text-slate-400">Tidak ada rincian tahun.</p>'}
        </div>
      </div>

      ${item.keterangan ? `
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span class="text-[11px] text-slate-500 font-bold block mb-0.5">Catatan Teknis:</span>
          <p class="text-slate-700 leading-relaxed">${item.keterangan}</p>
        </div>
      ` : ''}

      <div class="pt-3 border-t border-slate-200 flex justify-end">
        <button onclick="closeModal('projectDetailModal')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
          Tutup
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ==========================================
// 5. LOGIN & CAPTCHA HANDLING
// ==========================================
async function loadCaptcha() {
  try {
    const res = await fetch('/api/captcha');
    const json = await res.json();
    if (json.success) {
      state.captcha = json;
      const display = document.getElementById('captchaDisplay');
      if (display) display.textContent = json.display;
      const captchaInput = document.getElementById('loginCaptcha');
      if (captchaInput) captchaInput.value = '';
    }
  } catch (err) {
    console.error("Gagal memuat CAPTCHA:", err);
  }
}

function openLoginModal() {
  loadCaptcha();
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const captchaAnswer = document.getElementById('loginCaptcha').value.trim();
  const alertBox = document.getElementById('loginAlert');

  if (alertBox) alertBox.classList.add('hidden');

  if (!username || !password) {
    showLoginAlert("Username dan password wajib diisi.");
    return;
  }

  if (!captchaAnswer) {
    showLoginAlert("Silakan jawab perhitungan angka CAPTCHA.");
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        captchaId: state.captcha ? state.captcha.captchaId : '',
        captchaAnswer
      })
    });

    const json = await res.json();

    if (!json.success) {
      showLoginAlert(json.message || "Gagal masuk.");
      loadCaptcha();
      return;
    }

    // Success
    state.token = json.token;
    state.user = json.user;
    localStorage.setItem('siren_token', json.token);
    localStorage.setItem('siren_user', JSON.stringify(json.user));

    closeLoginModal();
    showInternalDashboard();
  } catch (err) {
    console.error("Login request error:", err);
    showLoginAlert("Terjadi kendala koneksi ke server.");
    loadCaptcha();
  }
}

function showLoginAlert(msg) {
  const alertBox = document.getElementById('loginAlert');
  if (alertBox) {
    alertBox.textContent = msg;
    alertBox.classList.remove('hidden');
  }
}

async function verifySession() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const json = await res.json();
    if (json.success) {
      state.user = json.user;
      localStorage.setItem('siren_user', JSON.stringify(json.user));
      showInternalDashboard();
    } else {
      logout();
    }
  } catch (err) {
    console.error("Verifikasi sesi gagal:", err);
    showPublicPortal();
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('siren_token');
  localStorage.removeItem('siren_user');
  showPublicPortal();
}

// ==========================================
// 6. DASHBOARD & VIEW NAVIGATION
// ==========================================
function showPublicPortal() {
  state.activeView = 'public';
  document.getElementById('publicPortalSection').classList.remove('hidden');
  document.getElementById('internalDashboardSection').classList.add('hidden');
  document.getElementById('navLoginBtn').classList.remove('hidden');
  document.getElementById('navUserBtn').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showInternalDashboard() {
  state.activeView = 'dashboard';
  document.getElementById('publicPortalSection').classList.add('hidden');
  document.getElementById('internalDashboardSection').classList.remove('hidden');
  document.getElementById('navLoginBtn').classList.add('hidden');
  document.getElementById('navUserBtn').classList.remove('hidden');

  // Update User Header Info
  if (state.user) {
    document.querySelectorAll('.current-user-name').forEach(el => el.textContent = state.user.nama);
    document.querySelectorAll('.current-user-role').forEach(el => el.textContent = `${state.user.role} (${state.user.bidang})`);
    document.querySelectorAll('.current-user-nip').forEach(el => el.textContent = `NIP: ${state.user.nip || '-'}`);
    
    // Superadmin-only navigation menu items
    const isSuperadmin = state.user.role === 'Superadmin';
    document.querySelectorAll('.superadmin-only').forEach(el => {
      el.style.display = isSuperadmin ? '' : 'none';
    });
  }

  // Switch to default inner tab
  switchInternalTab('dashboard');
}

function switchInternalTab(tabName) {
  state.activeView = tabName;

  // Update sidebar buttons with light theme styling
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'hover:text-slate-900', 'font-medium');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'font-bold', 'shadow-sm');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'hover:text-slate-900', 'font-medium');
    }
  });

  // Hide all tab panes
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

  // Show selected pane
  const activePane = document.getElementById(`tabPane-${tabName}`);
  if (activePane) activePane.classList.remove('hidden');

  // Specific triggers per tab
  if (tabName === 'dashboard') {
    renderInternalInfographics();
    renderInternalTable();
  } else if (tabName === 'pekerjaan') {
    renderInternalTable();
  } else if (tabName === 'users') {
    loadUsersList();
  } else if (tabName === 'cms') {
    loadCmsEditorForm();
  } else if (tabName === 'tahun') {
    renderTahunManagementPane();
  } else if (tabName === 'database') {
    loadDatabaseConfig();
  } else if (tabName === 'map') {
    setTimeout(() => {
      if (typeof window.initGoogleMap === 'function') {
        window.initGoogleMap('internalMap');
        window.updateMapMarkers(getFilteredProjects());
      }
    }, 150);
  }
}

// ==========================================
// 7. INTERNAL INFOGRAPHICS (2+ SEGMENTS)
// ==========================================
function renderInternalInfographics() {
  if (!state.stats) return;

  // Segmen 1: Chart Sebaran Anggaran & Pekerjaan per Kecamatan
  const ctxKec = document.getElementById('chartKecamatan');
  if (ctxKec) {
    if (state.charts.kecamatan) state.charts.kecamatan.destroy();

    const labels = state.stats.sebaran_kecamatan.map(k => k.nama);
    const dataAnggaranM = state.stats.sebaran_kecamatan.map(k => Number((k.total_anggaran / 1e9).toFixed(2)));
    const dataJumlah = state.stats.sebaran_kecamatan.map(k => k.total_pekerjaan);

    state.charts.kecamatan = new Chart(ctxKec, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Anggaran (Miliar Rp)',
            data: dataAnggaranM,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Jumlah Pekerjaan (Titik)',
            data: dataJumlah,
            type: 'line',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderWidth: 2.5,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#1e293b', font: { weight: '600', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: function(context) {
                if (context.dataset.yAxisID === 'y') {
                  return `Anggaran: Rp ${context.parsed.y} Miliar`;
                }
                return `Pekerjaan: ${context.parsed.y} Titik`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#334155', font: { size: 10, weight: '600' } },
            grid: { display: false }
          },
          y: {
            type: 'linear',
            position: 'left',
            ticks: { color: '#334155', font: { size: 10 } },
            grid: { color: '#f1f5f9' },
            title: { display: true, text: 'Miliar Rupiah (Rp)', color: '#0f172a', font: { weight: 'bold', size: 11 } },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#d97706', font: { size: 10 } },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Jumlah Titik', color: '#d97706', font: { weight: 'bold', size: 11 } },
            beginAtZero: true
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const clickedKecamatan = labels[index];
            applyInfographicKecamatanFilter(clickedKecamatan);
          }
        }
      }
    });
  }

  // Segmen 2: Chart Alokasi Anggaran per Tahun Multi-Bidang
  const ctxTahun = document.getElementById('chartTahun');
  if (ctxTahun) {
    if (state.charts.tahun) state.charts.tahun.destroy();

    const years = state.stats.sebaran_tahun.map(t => t.tahun);
    const dataBM = state.stats.sebaran_tahun.map(t => (t.alokasi_bidang['Bina Marga'] || 0) / 1e9);
    const dataSDA = state.stats.sebaran_tahun.map(t => (t.alokasi_bidang['SDA BK'] || 0) / 1e9);
    const dataCK = state.stats.sebaran_tahun.map(t => (t.alokasi_bidang['Cipta Karya'] || 0) / 1e9);
    const dataTRP = state.stats.sebaran_tahun.map(t => (t.alokasi_bidang['Tata Ruang'] || 0) / 1e9);

    state.charts.tahun = new Chart(ctxTahun, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: 'Bina Marga', data: dataBM, backgroundColor: '#2563eb' },
          { label: 'SDA BK', data: dataSDA, backgroundColor: '#0d9488' },
          { label: 'Cipta Karya', data: dataCK, backgroundColor: '#7c3aed' },
          { label: 'Tata Ruang', data: dataTRP, backgroundColor: '#d97706' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#1e293b', font: { weight: '600', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: Rp ${ctx.parsed.y.toFixed(2)} Miliar`
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#1e293b', font: { weight: '700', size: 11 } },
            grid: { display: false }
          },
          y: {
            stacked: true,
            ticks: { color: '#334155', font: { size: 10 } },
            grid: { color: '#f1f5f9' },
            title: { display: true, text: 'Miliar Rupiah (Rp)', color: '#0f172a', font: { weight: 'bold', size: 11 } },
            beginAtZero: true
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const clickedYear = years[index];
            applyInfographicTahunFilter(clickedYear);
          }
        }
      }
    });
  }

  // Segmen 3: Chart Komposisi Bidang (Donut)
  const ctxBidang = document.getElementById('chartBidang');
  if (ctxBidang) {
    if (state.charts.bidang) state.charts.bidang.destroy();

    const bLabels = state.stats.sebaran_bidang.map(b => b.bidang);
    const bValues = state.stats.sebaran_bidang.map(b => b.jumlah);

    state.charts.bidang = new Chart(ctxBidang, {
      type: 'doughnut',
      data: {
        labels: bLabels,
        datasets: [{
          data: bValues,
          backgroundColor: ['#2563eb', '#0d9488', '#7c3aed', '#d97706'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#1e293b', font: { weight: '600', size: 10 } }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const clickedBidang = bLabels[index];
            applyInfographicBidangFilter(clickedBidang);
          }
        }
      }
    });
  }
}

// Click on infographic triggers table filter
function applyInfographicKecamatanFilter(kecName) {
  state.filters.kecamatan = kecName;
  syncFilterControls();
  renderInternalTable();
}

function applyInfographicTahunFilter(tahun) {
  state.filters.tahun = tahun;
  syncFilterControls();
  renderInternalTable();
}

function applyInfographicBidangFilter(bidang) {
  state.filters.bidang = bidang;
  syncFilterControls();
  renderInternalTable();
}

function clearInfographicFilter() {
  resetAllInternalFilters();
}

// ==========================================
// 8. INTERNAL TABLE & CRUD PEKERJAAN
// ==========================================
function renderInternalTable(filteredList = null) {
  const list = filteredList || getFilteredProjects();
  const tableBody = document.getElementById('internalTableBody');
  const tabTableBody = document.getElementById('tabPekerjaanTableBody');
  const countEl = document.getElementById('internalTableCount');

  if (countEl) countEl.textContent = `${list.length} Data Pekerjaan`;

  const emptyRow = `
    <tr>
      <td colspan="7" class="text-center py-8 text-slate-500 font-medium">
        Tidak ada pekerjaan ditemukan dengan filter atau pencarian saat ini.
      </td>
    </tr>
  `;

  if (list.length === 0) {
    if (tableBody) tableBody.innerHTML = emptyRow;
    if (tabTableBody) tabTableBody.innerHTML = emptyRow;
    return;
  }

  const rowsHtml = list.map((item, idx) => {
    let bidangClass = "badge-bm";
    let bidangBorder = "bidang-bina-marga";
    if (item.bidang === "SDA BK") {
      bidangClass = "badge-sda";
      bidangBorder = "bidang-sda-bk";
    } else if (item.bidang === "Cipta Karya") {
      bidangClass = "badge-ck";
      bidangBorder = "bidang-cipta-karya";
    } else if (item.bidang === "Tata Ruang") {
      bidangClass = "badge-trp";
      bidangBorder = "bidang-tata-ruang";
    }

    const totalBudget = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.kebutuhan_anggaran || 0);

    return `
      <tr class="${bidangBorder} hover:bg-blue-50/50 transition-colors">
        <td class="text-xs text-slate-400 font-mono text-center">${idx + 1}</td>
        <td>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${bidangClass}">
            ${item.bidang}
          </span>
          <div class="text-[11px] text-slate-500 mt-0.5">${item.sub_bidang || '-'}</div>
        </td>
        <td>
          <div class="font-bold text-slate-900 text-sm">${item.nama_pekerjaan}</div>
          <div class="text-xs text-slate-500 mt-0.5">Ruas: ${item.ruas || '-'} • Prioritas ${item.prioritas || 2}</div>
        </td>
        <td><span class="text-xs font-bold text-slate-800">${item.kecamatan}</span></td>
        <td><span class="text-xs font-mono font-bold text-blue-900">${totalBudget}</span></td>
        <td>
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            ${item.status || 'Direncanakan'}
          </span>
        </td>
        <td class="text-right whitespace-nowrap pr-4">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="viewProjectDetail('${item.id}')" title="Detail" class="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg transition-colors border border-slate-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <button onclick="openEditPekerjaanModal('${item.id}')" title="Edit" class="p-1.5 bg-slate-100 hover:bg-amber-600 hover:text-white text-amber-700 rounded-lg transition-colors border border-slate-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button onclick="confirmDeletePekerjaan('${item.id}')" title="Hapus" class="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition-colors border border-slate-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (tableBody) tableBody.innerHTML = rowsHtml;
  if (tabTableBody) tabTableBody.innerHTML = rowsHtml;
}

// Modal Tambah / Edit Pekerjaan
function openAddPekerjaanModal() {
  state.editingItem = null;
  document.getElementById('modalPekerjaanTitle').textContent = 'Tambah Perencanaan Pekerjaan Baru';
  document.getElementById('pekerjaanForm').reset();
  document.getElementById('pekerjaanIdField').value = '';

  // Render dynamic year inputs
  renderModalYearFields(null);

  // Auto-fill Bidang based on user's assigned department
  const bidangSelect = document.getElementById('modalBidangSelect');
  if (bidangSelect && state.user) {
    if (state.user.role !== 'Superadmin' && state.user.bidang !== 'Semua') {
      bidangSelect.value = state.user.bidang;
      bidangSelect.disabled = true;
    } else {
      bidangSelect.disabled = false;
    }
  }

  const modal = document.getElementById('pekerjaanModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditPekerjaanModal(id) {
  const item = state.pekerjaan.find(p => p.id === id);
  if (!item) return;

  state.editingItem = item;
  document.getElementById('modalPekerjaanTitle').textContent = 'Edit Data Perencanaan Pekerjaan';

  document.getElementById('pekerjaanIdField').value = item.id;
  document.getElementById('modalNamaPekerjaan').value = item.nama_pekerjaan || '';
  document.getElementById('modalBidangSelect').value = item.bidang || 'Bina Marga';
  document.getElementById('modalSubBidang').value = item.sub_bidang || '';
  document.getElementById('modalRuas').value = item.ruas || '';
  document.getElementById('modalKecamatanSelect').value = item.kecamatan || '';
  document.getElementById('modalPanjangKm').value = item.panjang_total_km || 0;
  document.getElementById('modalAnggaran').value = item.kebutuhan_anggaran || 0;
  document.getElementById('modalPrioritas').value = item.prioritas || 2;
  document.getElementById('modalLat').value = item.lat || '';
  document.getElementById('modalLng').value = item.lng || '';
  document.getElementById('modalStatus').value = item.status || 'Direncanakan';
  document.getElementById('modalKeterangan').value = item.keterangan || '';

  // Dynamic Years breakdown
  renderModalYearFields(item);

  const modal = document.getElementById('pekerjaanModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

async function handlePekerjaanSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('pekerjaanIdField').value;
  const isEdit = Boolean(id);

  // Collect dynamic years
  const anggaran_tahun = {};
  const years = state.activeYears && state.activeYears.length > 0 ? state.activeYears : ['2027', '2028', '2029', '2030', '2031'];
  years.forEach(yr => {
    const input = document.getElementById(`modalY_${yr}`);
    anggaran_tahun[yr] = Number(input ? input.value : 0);
  });

  const payload = {
    nama_pekerjaan: document.getElementById('modalNamaPekerjaan').value.trim(),
    bidang: document.getElementById('modalBidangSelect').value,
    sub_bidang: document.getElementById('modalSubBidang').value.trim(),
    ruas: document.getElementById('modalRuas').value.trim(),
    kecamatan: document.getElementById('modalKecamatanSelect').value,
    panjang_total_km: Number(document.getElementById('modalPanjangKm').value || 0),
    kebutuhan_anggaran: Number(document.getElementById('modalAnggaran').value || 0),
    prioritas: Number(document.getElementById('modalPrioritas').value || 2),
    lat: Number(document.getElementById('modalLat').value),
    lng: Number(document.getElementById('modalLng').value),
    status: document.getElementById('modalStatus').value,
    keterangan: document.getElementById('modalKeterangan').value.trim(),
    anggaran_tahun: anggaran_tahun
  };

  try {
    const url = isEdit ? `/api/pekerjaan/${id}` : '/api/pekerjaan';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.success) {
      alert(json.message || 'Gagal menyimpan data pekerjaan.');
      return;
    }

    alert(json.message || 'Data berhasil disimpan.');
    closeModal('pekerjaanModal');
    await loadPekerjaan();
    await loadStats();
    renderInternalInfographics();
  } catch (err) {
    console.error("Save error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

async function confirmDeletePekerjaan(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus data perencanaan ini?')) return;

  try {
    const res = await fetch(`/api/pekerjaan/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const json = await res.json();
    if (json.success) {
      alert(json.message || 'Data berhasil dihapus.');
      await loadPekerjaan();
      await loadStats();
      renderInternalInfographics();
    } else {
      alert(json.message || 'Gagal menghapus data.');
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

// Export CSV
function exportPekerjaanCSV() {
  const list = getFilteredProjects();
  if (list.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const years = state.activeYears;
  const yearHeaders = years.map(y => `TA_${y}`).join(',');
  const headers = ['No', 'Bidang', 'Sub_Bidang', 'Nama_Pekerjaan', 'Ruas', 'Kecamatan', 'Panjang_Km', 'Kebutuhan_Anggaran_Rp', 'Prioritas', yearHeaders, 'Status'].join(',');

  const rows = list.map((p, idx) => {
    const yearValues = years.map(y => (p.anggaran_tahun && p.anggaran_tahun[y]) || 0).join(',');
    const cleanName = `"${(p.nama_pekerjaan || '').replace(/"/g, '""')}"`;
    const cleanRuas = `"${(p.ruas || '').replace(/"/g, '""')}"`;

    return [
      idx + 1,
      `"${p.bidang || ''}"`,
      `"${p.sub_bidang || ''}"`,
      cleanName,
      cleanRuas,
      `"${p.kecamatan || ''}"`,
      p.panjang_total_km || 0,
      p.kebutuhan_anggaran || 0,
      p.prioritas || 2,
      yearValues,
      `"${p.status || ''}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SIREN_Perencanaan_Demak_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 9. SUPERADMIN USER MANAGEMENT
// ==========================================
async function loadUsersList() {
  if (!state.token) return;

  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const json = await res.json();
    if (!json.success) {
      console.warn("Gagal memuat pengguna:", json.message);
      return;
    }

    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = json.data.map((u, idx) => {
      let roleBadge = 'bg-blue-100 text-blue-800';
      if (u.role === 'Superadmin') roleBadge = 'bg-purple-100 text-purple-800 font-bold';
      else if (u.role === 'Kepala Dinas' || u.role === 'Sekretaris Dinas') roleBadge = 'bg-emerald-100 text-emerald-800 font-bold';

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="text-center font-mono text-slate-400 text-xs">${idx + 1}</td>
          <td>
            <div class="font-bold text-slate-900 text-xs">${u.nama}</div>
            <div class="text-[11px] text-slate-500 font-mono">NIP: ${u.nip || '-'}</div>
          </td>
          <td><code class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">${u.username}</code></td>
          <td><span class="px-2 py-0.5 rounded text-[11px] font-semibold ${roleBadge}">${u.role}</span></td>
          <td><span class="text-xs font-semibold text-slate-700">${u.bidang}</span></td>
          <td>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
              ${u.status || 'Aktif'}
            </span>
          </td>
          <td class="text-right whitespace-nowrap pr-4">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="openEditUserModal('${u.id}')" title="Edit Pengguna" class="p-1.5 bg-slate-100 hover:bg-amber-600 hover:text-white text-amber-700 rounded-lg transition-colors border border-slate-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onclick="confirmDeleteUser('${u.id}')" title="Hapus Pengguna" class="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition-colors border border-slate-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error("Gagal memuat pengguna:", err);
  }
}

function openAddUserModal() {
  state.editingUser = null;
  document.getElementById('modalUserTitle').textContent = 'Tambah Pengguna Baru';
  document.getElementById('userForm').reset();
  document.getElementById('userIdField').value = '';
  document.getElementById('passwordHelpText').textContent = 'Wajib diisi untuk pengguna baru.';
  document.getElementById('modalUserPassword').required = true;

  const modal = document.getElementById('userModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

async function openEditUserModal(id) {
  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const json = await res.json();
    if (!json.success) return;

    const user = json.data.find(u => u.id === id);
    if (!user) return;

    state.editingUser = user;
    document.getElementById('modalUserTitle').textContent = 'Edit Data Pengguna';
    document.getElementById('userIdField').value = user.id;
    document.getElementById('modalUserNama').value = user.nama || '';
    document.getElementById('modalUserNip').value = user.nip || '';
    document.getElementById('modalUserUsername').value = user.username || '';
    document.getElementById('modalUserRole').value = user.role || 'Koordinator';
    document.getElementById('modalUserBidang').value = user.bidang || 'Bina Marga';
    document.getElementById('modalUserJabatan').value = user.jabatan || '';
    document.getElementById('modalUserStatus').value = user.status || 'Aktif';

    document.getElementById('modalUserPassword').value = '';
    document.getElementById('modalUserPassword').required = false;
    document.getElementById('passwordHelpText').textContent = 'Kosongkan jika password tidak ingin diubah.';

    const modal = document.getElementById('userModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } catch (err) {
    console.error("User edit load error:", err);
  }
}

async function handleUserSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('userIdField').value;
  const isEdit = Boolean(id);

  const payload = {
    nama: document.getElementById('modalUserNama').value.trim(),
    nip: document.getElementById('modalUserNip').value.trim(),
    username: document.getElementById('modalUserUsername').value.trim(),
    role: document.getElementById('modalUserRole').value,
    bidang: document.getElementById('modalUserBidang').value,
    jabatan: document.getElementById('modalUserJabatan').value.trim(),
    status: document.getElementById('modalUserStatus').value
  };

  const passwordVal = document.getElementById('modalUserPassword').value;
  if (passwordVal) {
    payload.password = passwordVal;
  }

  try {
    const url = isEdit ? `/api/users/${id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.success) {
      alert(json.message || 'Gagal menyimpan data pengguna.');
      return;
    }

    alert(json.message || 'Data pengguna berhasil disimpan.');
    closeModal('userModal');
    loadUsersList();
  } catch (err) {
    console.error("User save error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

async function confirmDeleteUser(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) return;

  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const json = await res.json();
    if (json.success) {
      alert(json.message || 'Pengguna berhasil dihapus.');
      loadUsersList();
    } else {
      alert(json.message || 'Gagal menghapus pengguna.');
    }
  } catch (err) {
    console.error("User delete error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

// ==========================================
// 10. SUPERADMIN CMS TEXT MANAGEMENT
// ==========================================
function loadCmsEditorForm() {
  const c = state.cms || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('cmsSiteTitle', c.site_title);
  setVal('cmsSiteFullName', c.site_full_name);
  setVal('cmsSiteTagline', c.site_tagline);
  setVal('cmsSiteBadge', c.site_badge);
  setVal('cmsHeroWelcome', c.hero_welcome);
  setVal('cmsHeroTitle', c.hero_title);
  setVal('cmsHeroSubtitle', c.hero_subtitle);
  setVal('cmsHeroDescription', c.hero_description);
  setVal('cmsMapTitle', c.map_title);
  setVal('cmsMapSubtitle', c.map_subtitle);
  setVal('cmsTableTitle', c.table_title);
  setVal('cmsFooterAddress', c.footer_address);
  setVal('cmsFooterPhone', c.footer_phone);
  setVal('cmsFooterEmail', c.footer_email);
  setVal('cmsFooterHours', c.footer_hours);
  setVal('cmsFooterCopyright', c.footer_copyright);
}

async function handleCmsSubmit(e) {
  e.preventDefault();

  const payload = {
    site_title: document.getElementById('cmsSiteTitle').value.trim(),
    site_full_name: document.getElementById('cmsSiteFullName').value.trim(),
    site_tagline: document.getElementById('cmsSiteTagline').value.trim(),
    site_badge: document.getElementById('cmsSiteBadge').value.trim(),
    hero_title: document.getElementById('cmsHeroTitle').value.trim(),
    hero_subtitle: document.getElementById('cmsHeroSubtitle').value.trim(),
    hero_welcome: document.getElementById('cmsHeroWelcome').value.trim(),
    hero_description: document.getElementById('cmsHeroDescription').value.trim(),
    map_title: document.getElementById('cmsMapTitle').value.trim(),
    map_subtitle: document.getElementById('cmsMapSubtitle').value.trim(),
    table_title: document.getElementById('cmsTableTitle').value.trim(),
    footer_address: document.getElementById('cmsFooterAddress').value.trim(),
    footer_phone: document.getElementById('cmsFooterPhone').value.trim(),
    footer_email: document.getElementById('cmsFooterEmail').value.trim(),
    footer_hours: document.getElementById('cmsFooterHours').value.trim(),
    footer_copyright: document.getElementById('cmsFooterCopyright').value.trim()
  };

  try {
    const res = await fetch('/api/cms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      state.cms = json.data;
      applyCmsTexts();
      alert('Semua perubahan teks berhasil disimpan dan diterapkan pada antarmuka publik maupun internal!');
    } else {
      alert(json.message || 'Gagal menyimpan perubahan teks.');
    }
  } catch (err) {
    console.error("CMS update error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

// ==========================================
// 11. SUPERADMIN DATABASE CONFIG & TEST
// ==========================================
async function loadDatabaseConfig() {
  if (!state.token) return;

  try {
    const res = await fetch('/api/database/config', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const json = await res.json();
    if (!json.success) return;

    const cfg = json.data;
    const hostEl = document.getElementById('dbHostInput');
    const portEl = document.getElementById('dbPortInput');
    const dbEl = document.getElementById('dbDatabaseInput');
    const userEl = document.getElementById('dbUserInput');
    const enabledEl = document.getElementById('dbEnabledInput');

    if (hostEl) hostEl.value = cfg.host || 'siren.satuputarudemak.id';
    if (portEl) portEl.value = cfg.port || 3306;
    if (dbEl) dbEl.value = cfg.database || 'u490770675_siren';
    if (userEl) userEl.value = cfg.user || 'u490770675_adminsiren';
    if (enabledEl) enabledEl.checked = cfg.enabled !== false;

    updateDbStatusUI(cfg.isConnected, cfg.host, cfg.database, cfg.lastError);
  } catch (err) {
    console.error("Load db config error:", err);
  }
}

function updateDbStatusUI(isConnected, host, database, errorMsg = '') {
  const icon = document.getElementById('dbStatusIcon');
  const text = document.getElementById('dbStatusText');
  const subText = document.getElementById('dbStatusSubText');
  const banner = document.getElementById('dbStatusBanner');

  if (isConnected) {
    if (icon) icon.className = "w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse";
    if (text) text.innerHTML = `<span class="text-emerald-700 font-bold">Terhubung ke Database MySQL Hostinger</span>`;
    if (subText) subText.textContent = `Host: ${host} • Database: ${database} • Status: Aktif & Sinkron Otomatis`;
    if (banner) banner.className = "p-4 rounded-2xl border flex items-center justify-between gap-4 bg-emerald-50 border-emerald-200";
  } else {
    if (icon) icon.className = "w-3.5 h-3.5 rounded-full bg-amber-500";
    if (text) text.innerHTML = `<span class="text-amber-800 font-bold">Mode Cadangan JSON Aktif (MySQL Menunggu Koneksi)</span>`;
    if (subText) subText.textContent = errorMsg ? `Keterangan: ${errorMsg}` : `Host: ${host} • Database: ${database}`;
    if (banner) banner.className = "p-4 rounded-2xl border flex items-center justify-between gap-4 bg-amber-50 border-amber-200";
  }
}

async function testDbConnection() {
  const host = document.getElementById('dbHostInput').value.trim();
  const port = parseInt(document.getElementById('dbPortInput').value, 10) || 3306;
  const database = document.getElementById('dbDatabaseInput').value.trim();
  const user = document.getElementById('dbUserInput').value.trim();
  const password = document.getElementById('dbPasswordInput').value;

  const btn = event ? event.target : null;
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/database/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ host, port, database, user, password })
    });

    const json = await res.json();
    if (json.success) {
      alert(`[BERHASIL] ${json.message}\nHost: ${host}\nDatabase: ${database}`);
      updateDbStatusUI(true, host, database);
    } else {
      alert(`[STATUS KONEKSI]\n${json.message}\n\nSistem SIREN tetap berjalan aman dengan penyimpanan lokal JSON.`);
      updateDbStatusUI(false, host, database, json.message);
    }
  } catch (err) {
    console.error("Test connection error:", err);
    alert('Terjadi kesalahan saat menguji koneksi.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleSaveDbConfig(e) {
  e.preventDefault();

  const payload = {
    host: document.getElementById('dbHostInput').value.trim(),
    port: parseInt(document.getElementById('dbPortInput').value, 10) || 3306,
    database: document.getElementById('dbDatabaseInput').value.trim(),
    user: document.getElementById('dbUserInput').value.trim(),
    password: document.getElementById('dbPasswordInput').value,
    enabled: document.getElementById('dbEnabledInput').checked
  };

  try {
    const res = await fetch('/api/database/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      alert('Pengaturan database berhasil disimpan!');
      loadDatabaseConfig();
    } else {
      alert(json.message || 'Gagal menyimpan pengaturan database.');
    }
  } catch (err) {
    console.error("Save db config error:", err);
    alert('Terjadi kesalahan koneksi.');
  }
}

// Modal generic close helper
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Export functions to window
window.setKecamatanFilter = setKecamatanFilter;
window.resetKecamatanFilter = resetKecamatanFilter;
window.onKecamatanSelectChange = onKecamatanSelectChange;
window.setYearFilter = setYearFilter;
window.setTahunFilter = setTahunFilter;
window.setBidangFilter = setBidangFilter;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleLoginSubmit = handleLoginSubmit;
window.logout = logout;
window.showPublicPortal = showPublicPortal;
window.showInternalDashboard = showInternalDashboard;
window.switchInternalTab = switchInternalTab;
window.loadCaptcha = loadCaptcha;
window.openAddPekerjaanModal = openAddPekerjaanModal;
window.openEditPekerjaanModal = openEditPekerjaanModal;
window.handlePekerjaanSubmit = handlePekerjaanSubmit;
window.confirmDeletePekerjaan = confirmDeletePekerjaan;
window.exportPekerjaanCSV = exportPekerjaanCSV;
window.openAddUserModal = openAddUserModal;
window.openEditUserModal = openEditUserModal;
window.handleUserSubmit = handleUserSubmit;
window.confirmDeleteUser = confirmDeleteUser;
window.handleCmsSubmit = handleCmsSubmit;
window.handleAddTahun = handleAddTahun;
window.confirmDeleteTahun = confirmDeleteTahun;
window.testDbConnection = testDbConnection;
window.handleSaveDbConfig = handleSaveDbConfig;
window.handleSortChange = handleSortChange;
window.handleSortColumn = handleSortColumn;
window.viewProjectDetail = viewProjectDetail;
window.closeModal = closeModal;
window.clearInfographicFilter = clearInfographicFilter;
window.handleBidangFilterChange = handleBidangFilterChange;
window.handleTahunFilterChange = handleTahunFilterChange;
window.handleKecamatanFilterChange = handleKecamatanFilterChange;
window.handleInternalSearch = handleInternalSearch;
window.resetAllInternalFilters = resetAllInternalFilters;
window.syncFilterControls = syncFilterControls;
