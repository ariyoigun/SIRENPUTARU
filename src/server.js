// src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'siren_demak_secret_key_2026_dinputaru';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// File paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PEKERJAAN_FILE = path.join(DATA_DIR, 'pekerjaan.json');
const CMS_FILE = path.join(DATA_DIR, 'cms_texts.json');
const KECAMATAN_FILE = path.join(DATA_DIR, 'kecamatan.json');
const TAHUN_FILE = path.join(DATA_DIR, 'tahun.json');

// Helper to read/write JSON safely
function readJSON(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
  return fallback;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
    return false;
  }
}

// Database Synchronizers (Runs when MySQL is connected)
async function syncPekerjaanToDb(action, item) {
  if (!db.isConnected()) return;
  try {
    if (action === 'delete') {
      await db.query('DELETE FROM pekerjaan WHERE id = ?', [item.id || item]);
    } else {
      await db.query(`REPLACE INTO pekerjaan (id, bidang, sub_bidang, nama_pekerjaan, ruas, kecamatan, panjang_total_km, panjang_m, rusak_ringan_km, rusak_berat_km, kondisi, status_mantap, kebutuhan_anggaran, prioritas, anggaran_tahun_json, lat, lng, keterangan, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        item.id,
        item.bidang || 'Bina Marga',
        item.sub_bidang || '',
        item.nama_pekerjaan || '',
        item.ruas || '-',
        item.kecamatan || '',
        item.panjang_total_km || 0,
        item.panjang_m || 0,
        item.rusak_ringan_km || 0,
        item.rusak_berat_km || 0,
        item.kondisi || null,
        item.status_mantap || null,
        item.kebutuhan_anggaran || 0,
        item.prioritas || 2,
        JSON.stringify(item.anggaran_tahun || {}),
        item.lat || 0,
        item.lng || 0,
        item.keterangan || '',
        item.status || 'Direncanakan',
        item.created_by || 'admin'
      ]);
    }
  } catch (err) {
    console.error(`[DB Sync Error Pekerjaan]: ${err.message}`);
  }
}

async function syncUserToDb(action, user) {
  if (!db.isConnected()) return;
  try {
    if (action === 'delete') {
      await db.query('DELETE FROM users WHERE id = ?', [user.id || user]);
    } else {
      await db.query(`REPLACE INTO users (id, username, password, password_plain, nama, nip, role, bidang, jabatan, telepon, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        user.id,
        user.username,
        user.password,
        user.passwordPlain || null,
        user.nama,
        user.nip || '-',
        user.role,
        user.bidang,
        user.jabatan || '',
        user.telepon || '-',
        user.status || 'Aktif'
      ]);
    }
  } catch (err) {
    console.error(`[DB Sync Error User]: ${err.message}`);
  }
}

async function syncCmsToDb(texts) {
  if (!db.isConnected()) return;
  try {
    for (const [k, v] of Object.entries(texts)) {
      await db.query(`REPLACE INTO cms_texts (text_key, text_value) VALUES (?, ?)`, [k, String(v)]);
    }
  } catch (err) {
    console.error(`[DB Sync Error CMS]: ${err.message}`);
  }
}

// In-Memory CAPTCHA Store with 5-minute expiration
const captchaStore = new Map();
function cleanupCaptcha() {
  const now = Date.now();
  for (const [id, val] of captchaStore.entries()) {
    if (now - val.created > 5 * 60 * 1000) {
      captchaStore.delete(id);
    }
  }
}
setInterval(cleanupCaptcha, 60000);

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Akses ditolak.' });
    }
    const userRole = (req.user.role || '').toLowerCase();
    const hasRole = roles.some(r => r.toLowerCase() === userRole || userRole === 'superadmin');
    if (!hasRole) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak akses untuk tindakan ini.' });
    }
    next();
  };
}

// ==========================================
// 1. CAPTCHA ENDPOINTS
// ==========================================
app.get('/api/captcha', (req, res) => {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 15) + 1;
  const isAddition = Math.random() > 0.3; // 70% addition, 30% subtraction
  let question, answer;

  if (isAddition) {
    question = `${a} + ${b}`;
    answer = a + b;
  } else {
    const maxVal = Math.max(a, b);
    const minVal = Math.min(a, b);
    question = `${maxVal} - ${minVal}`;
    answer = maxVal - minVal;
  }

  const id = 'cap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  captchaStore.set(id, { answer, created: Date.now() });

  res.json({
    success: true,
    captchaId: id,
    question: question,
    display: `${question} = ?`
  });
});

// ==========================================
// 2. AUTHENTICATION (LOGIN & ME)
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { username, password, captchaId, captchaAnswer } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  // Validate Captcha
  if (!captchaId || !captchaAnswer) {
    return res.status(400).json({ success: false, message: 'Mohon isi perhitungan CAPTCHA dengan benar.' });
  }

  const storedCaptcha = captchaStore.get(captchaId);
  if (!storedCaptcha) {
    return res.status(400).json({ success: false, message: 'Kode CAPTCHA telah kedaluwarsa. Silakan refresh CAPTCHA.' });
  }

  if (parseInt(captchaAnswer, 10) !== storedCaptcha.answer) {
    captchaStore.delete(captchaId);
    return res.status(400).json({ success: false, message: 'Hasil perhitungan CAPTCHA salah. Silakan coba lagi.' });
  }
  // Remove used captcha
  captchaStore.delete(captchaId);

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Username tidak terdaftar.' });
  }

  if (user.status && user.status.toLowerCase() === 'nonaktif') {
    return res.status(403).json({ success: false, message: 'Akun Anda dinonaktifkan. Hubungi Superadmin.' });
  }

  // Password comparison
  const isValid = bcrypt.compareSync(password, user.password) || (user.passwordPlain && password === user.passwordPlain);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Password salah.' });
  }

  // Generate JWT token
  const tokenPayload = {
    id: user.id,
    username: user.username,
    nama: user.nama,
    nip: user.nip,
    role: user.role,
    bidang: user.bidang,
    jabatan: user.jabatan
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

  res.json({
    success: true,
    message: 'Login berhasil.',
    token,
    user: tokenPayload
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ==========================================
// 3. CMS / TEXT MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/cms', (req, res) => {
  const texts = readJSON(CMS_FILE, {});
  res.json({ success: true, data: texts });
});

app.put('/api/cms', authenticateToken, requireRole('superadmin'), (req, res) => {
  const current = readJSON(CMS_FILE, {});
  const updated = { ...current, ...req.body };
  writeJSON(CMS_FILE, updated);
  syncCmsToDb(updated);
  res.json({ success: true, message: 'Pengaturan teks berhasil diperbarui.', data: updated });
});

// ==========================================
// 3B. TAHUN ANGGARAN (SUPERADMIN SPECIAL MENU)
// ==========================================
app.get('/api/tahun', (req, res) => {
  const tahunList = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
  res.json({ success: true, data: tahunList });
});

app.post('/api/tahun', authenticateToken, requireRole('superadmin'), (req, res) => {
  let tahunList = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
  const { tahun } = req.body;

  if (!tahun || !/^\d{4}$/.test(String(tahun).trim())) {
    return res.status(400).json({ success: false, message: 'Format tahun tidak valid (harus 4 angka, contoh: 2032).' });
  }

  const tahunStr = String(tahun).trim();
  if (tahunList.includes(tahunStr)) {
    return res.status(400).json({ success: false, message: `Tahun ${tahunStr} sudah terdaftar dalam sistem.` });
  }

  tahunList.push(tahunStr);
  tahunList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  writeJSON(TAHUN_FILE, tahunList);

  res.status(201).json({
    success: true,
    message: `Tahun perencanaan ${tahunStr} berhasil ditambahkan.`,
    data: tahunList
  });
});

app.delete('/api/tahun/:year', authenticateToken, requireRole('superadmin'), (req, res) => {
  let tahunList = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
  const targetYear = req.params.year;

  if (tahunList.length <= 1) {
    return res.status(400).json({ success: false, message: 'Minimal harus ada 1 tahun perencanaan dalam sistem.' });
  }

  if (!tahunList.includes(targetYear)) {
    return res.status(404).json({ success: false, message: `Tahun ${targetYear} tidak ditemukan.` });
  }

  tahunList = tahunList.filter(y => y !== targetYear);
  writeJSON(TAHUN_FILE, tahunList);

  res.json({
    success: true,
    message: `Tahun ${targetYear} berhasil dihapus dari perencanaan.`,
    data: tahunList
  });
});

// ==========================================
// 3C. PENGATURAN KONEKSI DATABASE (SUPERADMIN)
// ==========================================
app.get('/api/database/config', authenticateToken, requireRole('superadmin'), (req, res) => {
  const cfg = db.getConfig();
  res.json({
    success: true,
    data: {
      host: cfg.host,
      port: cfg.port || 3306,
      database: cfg.database,
      user: cfg.user,
      enabled: cfg.enabled !== false,
      isConnected: db.isConnected(),
      lastError: db.getLastError()
    }
  });
});

app.post('/api/database/test', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const customConfig = req.body.host ? req.body : null;
  const result = await db.testConnection(customConfig);
  res.json(result);
});

app.post('/api/database/config', authenticateToken, requireRole('superadmin'), (req, res) => {
  const { host, port, database, user, password, enabled } = req.body;
  if (!host || !database || !user) {
    return res.status(400).json({ success: false, message: 'Host, database, dan user wajib diisi.' });
  }

  const currentCfg = db.getConfig();
  const newCfg = {
    host: host.trim(),
    port: parseInt(port, 10) || 3306,
    database: database.trim(),
    user: user.trim(),
    password: password !== undefined && password !== '' ? password : currentCfg.password,
    enabled: enabled !== false
  };

  const saved = db.saveConfig(newCfg);
  if (!saved) {
    return res.status(500).json({ success: false, message: 'Gagal menyimpan konfigurasi database.' });
  }

  res.json({
    success: true,
    message: 'Pengaturan database berhasil disimpan.',
    data: {
      host: newCfg.host,
      port: newCfg.port,
      database: newCfg.database,
      user: newCfg.user,
      enabled: newCfg.enabled
    }
  });
});

app.get('/api/database/download-sql', (req, res) => {
  const sqlFile = path.join(__dirname, '..', 'database_siren.sql');
  if (fs.existsSync(sqlFile)) {
    res.download(sqlFile, 'database_siren.sql');
  } else {
    res.status(404).json({ success: false, message: 'File SQL belum dibuat.' });
  }
});

// ==========================================
// 4. KECAMATAN ENDPOINTS
// ==========================================
app.get('/api/kecamatan', (req, res) => {
  const kecamatan = readJSON(KECAMATAN_FILE, []);
  const pekerjaan = readJSON(PEKERJAAN_FILE, []);

  // Compute summary count and budget per kecamatan
  const enriched = kecamatan.map(k => {
    const kName = k.nama.toLowerCase();
    const related = pekerjaan.filter(p => {
      const pKec = (p.kecamatan || '').toLowerCase();
      return pKec.includes(kName);
    });

    const totalAnggaran = related.reduce((sum, p) => sum + (p.kebutuhan_anggaran || 0), 0);
    const countBM = related.filter(p => p.bidang === 'Bina Marga').length;
    const countSDA = related.filter(p => p.bidang === 'SDA BK').length;
    const countCK = related.filter(p => p.bidang === 'Cipta Karya').length;
    const countTRP = related.filter(p => p.bidang === 'Tata Ruang').length;

    return {
      ...k,
      total_pekerjaan: related.length,
      total_anggaran: totalAnggaran,
      breakdown: {
        bina_marga: countBM,
        sda_bk: countSDA,
        cipta_karya: countCK,
        tata_ruang: countTRP
      }
    };
  });

  res.json({ success: true, data: enriched });
});

// ==========================================
// 5. PEKERJAAN (PERENCANAAN) ENDPOINTS
// ==========================================
app.get('/api/pekerjaan', (req, res) => {
  let list = readJSON(PEKERJAAN_FILE, []);
  const { kecamatan, tahun, bidang, search, prioritas, status } = req.query;

  // Filter Kecamatan
  if (kecamatan && kecamatan !== 'all' && kecamatan !== 'semua') {
    const kLower = kecamatan.toLowerCase();
    list = list.filter(p => (p.kecamatan || '').toLowerCase().includes(kLower));
  }

  // Filter Tahun
  if (tahun && tahun !== 'all' && tahun !== 'semua') {
    list = list.filter(p => {
      if (!p.anggaran_tahun) return false;
      const budgetInYear = p.anggaran_tahun[tahun];
      return budgetInYear && budgetInYear > 0;
    });
  }

  // Filter Bidang
  if (bidang && bidang !== 'all' && bidang !== 'semua') {
    const bLower = bidang.toLowerCase();
    list = list.filter(p => (p.bidang || '').toLowerCase().includes(bLower));
  }

  // Filter Prioritas
  if (prioritas && prioritas !== 'all') {
    list = list.filter(p => String(p.prioritas) === String(prioritas));
  }

  // Filter Status
  if (status && status !== 'all') {
    list = list.filter(p => (p.status || '').toLowerCase() === status.toLowerCase());
  }

  // Search keyword
  if (search && search.trim() !== '') {
    const q = search.toLowerCase();
    list = list.filter(p =>
      (p.nama_pekerjaan || '').toLowerCase().includes(q) ||
      (p.ruas || '').toLowerCase().includes(q) ||
      (p.kecamatan || '').toLowerCase().includes(q) ||
      (p.sub_bidang || '').toLowerCase().includes(q) ||
      (p.keterangan || '').toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

app.get('/api/pekerjaan/:id', (req, res) => {
  const list = readJSON(PEKERJAAN_FILE, []);
  const item = list.find(p => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Data pekerjaan tidak ditemukan.' });
  }
  res.json({ success: true, data: item });
});

// Create new pekerjaan (Coordinator, Kabid, Superadmin)
app.post('/api/pekerjaan', authenticateToken, (req, res) => {
  const user = req.user;
  const list = readJSON(PEKERJAAN_FILE, []);
  const body = req.body;

  // Validation
  if (!body.nama_pekerjaan || !body.bidang || !body.kecamatan) {
    return res.status(400).json({ success: false, message: 'Nama pekerjaan, bidang, dan kecamatan wajib diisi.' });
  }

  // RBAC: coordinator/kabid can only insert projects for their own bidang unless superadmin or kadin
  if (user.role !== 'Superadmin' && user.role !== 'Kepala Dinas' && user.role !== 'Sekretaris Dinas') {
    if (user.bidang !== 'Semua' && user.bidang.toLowerCase() !== body.bidang.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Anda hanya memiliki hak untuk menambah pekerjaan pada bidang ${user.bidang}.`
      });
    }
  }

  const prefix = body.bidang === 'Bina Marga' ? 'BM' : (body.bidang === 'SDA BK' ? 'SDA' : (body.bidang === 'Cipta Karya' ? 'CK' : 'TRP'));
  const newId = `${prefix}-PRJ-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

  // Default coordinate if missing: pick center of first kecamatan mentioned
  let lat = Number(body.lat);
  let lng = Number(body.lng);
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    const kecamatanList = readJSON(KECAMATAN_FILE, []);
    const kData = kecamatanList.find(k => (body.kecamatan || '').toLowerCase().includes(k.nama.toLowerCase())) || kecamatanList[0] || { lat: -6.8944, lng: 110.6385 };
    lat = Number((kData.lat + (Math.random() - 0.5) * 0.02).toFixed(5));
    lng = Number((kData.lng + (Math.random() - 0.5) * 0.02).toFixed(5));
  }

  const newItem = {
    id: newId,
    bidang: body.bidang,
    sub_bidang: body.sub_bidang || 'Pekerjaan Fisik',
    nama_pekerjaan: body.nama_pekerjaan,
    ruas: body.ruas || '-',
    kecamatan: body.kecamatan,
    panjang_total_km: Number(body.panjang_total_km || 0),
    panjang_m: Number(body.panjang_m || 0),
    rusak_ringan_km: Number(body.rusak_ringan_km || 0),
    rusak_berat_km: Number(body.rusak_berat_km || 0),
    kebutuhan_anggaran: Number(body.kebutuhan_anggaran || 0),
    prioritas: Number(body.prioritas || 2),
    anggaran_tahun: (() => {
      const activeYears = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
      const resYears = {};
      activeYears.forEach(y => {
        resYears[y] = Number((body.anggaran_tahun && body.anggaran_tahun[y]) || body[`anggaran_${y}`] || 0);
      });
      return resYears;
    })(),
    lat,
    lng,
    keterangan: body.keterangan || `Diusulkan oleh ${user.nama} (${user.role} ${user.bidang})`,
    status: body.status || 'Direncanakan',
    created_by: user.username,
    created_at: new Date().toISOString()
  };

  list.unshift(newItem);
  writeJSON(PEKERJAAN_FILE, list);
  syncPekerjaanToDb('save', newItem);

  res.status(201).json({
    success: true,
    message: 'Data perencanaan pekerjaan berhasil ditambahkan.',
    data: newItem
  });
});

// Update pekerjaan
app.put('/api/pekerjaan/:id', authenticateToken, (req, res) => {
  const user = req.user;
  const list = readJSON(PEKERJAAN_FILE, []);
  const index = list.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Data pekerjaan tidak ditemukan.' });
  }

  const existing = list[index];

  // RBAC check
  if (user.role !== 'Superadmin' && user.role !== 'Kepala Dinas' && user.role !== 'Sekretaris Dinas') {
    if (user.bidang !== 'Semua' && user.bidang.toLowerCase() !== existing.bidang.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Anda tidak memiliki hak untuk mengedit pekerjaan bidang ${existing.bidang}.`
      });
    }
  }

  const body = req.body;
  const updatedItem = {
    ...existing,
    nama_pekerjaan: body.nama_pekerjaan || existing.nama_pekerjaan,
    bidang: body.bidang || existing.bidang,
    sub_bidang: body.sub_bidang || existing.sub_bidang,
    ruas: body.ruas !== undefined ? body.ruas : existing.ruas,
    kecamatan: body.kecamatan || existing.kecamatan,
    panjang_total_km: body.panjang_total_km !== undefined ? Number(body.panjang_total_km) : existing.panjang_total_km,
    panjang_m: body.panjang_m !== undefined ? Number(body.panjang_m) : existing.panjang_m,
    rusak_ringan_km: body.rusak_ringan_km !== undefined ? Number(body.rusak_ringan_km) : existing.rusak_ringan_km,
    rusak_berat_km: body.rusak_berat_km !== undefined ? Number(body.rusak_berat_km) : existing.rusak_berat_km,
    kebutuhan_anggaran: body.kebutuhan_anggaran !== undefined ? Number(body.kebutuhan_anggaran) : existing.kebutuhan_anggaran,
    prioritas: body.prioritas !== undefined ? Number(body.prioritas) : existing.prioritas,
    anggaran_tahun: (() => {
      const activeYears = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
      const resYears = { ...(existing.anggaran_tahun || {}) };
      activeYears.forEach(y => {
        if (body.anggaran_tahun && body.anggaran_tahun[y] !== undefined) {
          resYears[y] = Number(body.anggaran_tahun[y]);
        } else if (body[`anggaran_${y}`] !== undefined) {
          resYears[y] = Number(body[`anggaran_${y}`]);
        }
      });
      return resYears;
    })(),
    lat: body.lat !== undefined ? Number(body.lat) : existing.lat,
    lng: body.lng !== undefined ? Number(body.lng) : existing.lng,
    keterangan: body.keterangan !== undefined ? body.keterangan : existing.keterangan,
    status: body.status || existing.status,
    updated_by: user.username,
    updated_at: new Date().toISOString()
  };

  list[index] = updatedItem;
  writeJSON(PEKERJAAN_FILE, list);
  syncPekerjaanToDb('save', updatedItem);

  res.json({
    success: true,
    message: 'Data pekerjaan berhasil diperbarui.',
    data: updatedItem
  });
});

// Delete pekerjaan
app.delete('/api/pekerjaan/:id', authenticateToken, (req, res) => {
  const user = req.user;
  const list = readJSON(PEKERJAAN_FILE, []);
  const item = list.find(p => p.id === req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Data pekerjaan tidak ditemukan.' });
  }

  // RBAC check
  if (user.role !== 'Superadmin' && user.role !== 'Kepala Dinas' && user.role !== 'Sekretaris Dinas') {
    if (user.bidang !== 'Semua' && user.bidang.toLowerCase() !== item.bidang.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Anda tidak memiliki hak untuk menghapus pekerjaan bidang ${item.bidang}.`
      });
    }
  }

  const filtered = list.filter(p => p.id !== req.params.id);
  writeJSON(PEKERJAAN_FILE, filtered);
  syncPekerjaanToDb('delete', item);

  res.json({ success: true, message: 'Data pekerjaan berhasil dihapus.' });
});

// ==========================================
// 6. STATS & INFOGRAFIS (FOR INTERNAL DASHBOARD)
// ==========================================
app.get('/api/stats', (req, res) => {
  const pekerjaan = readJSON(PEKERJAAN_FILE, []);
  const kecamatan = readJSON(KECAMATAN_FILE, []);

  const total_pekerjaan = pekerjaan.length;
  const total_anggaran = pekerjaan.reduce((acc, p) => acc + (p.kebutuhan_anggaran || 0), 0);

  // Infografis 1: Sebaran Pekerjaan & Anggaran per Kecamatan
  const sebaran_kecamatan = kecamatan.map(k => {
    const kName = k.nama.toLowerCase();
    const related = pekerjaan.filter(p => (p.kecamatan || '').toLowerCase().includes(kName));
    const totalAnggaranKec = related.reduce((sum, p) => sum + (p.kebutuhan_anggaran || 0), 0);

    return {
      id: k.id,
      nama: k.nama,
      total_pekerjaan: related.length,
      total_anggaran: totalAnggaranKec,
      bina_marga: related.filter(p => p.bidang === 'Bina Marga').length,
      sda_bk: related.filter(p => p.bidang === 'SDA BK').length,
      cipta_karya: related.filter(p => p.bidang === 'Cipta Karya').length,
      tata_ruang: related.filter(p => p.bidang === 'Tata Ruang').length
    };
  });

  // Infografis 2: Sebaran Alokasi Anggaran & Pekerjaan per Tahun (Dinamis sesuai data tahun)
  const years = readJSON(TAHUN_FILE, ['2027', '2028', '2029', '2030', '2031']);
  const sebaran_tahun = years.map(yr => {
    let budgetTotal = 0;
    let countTotal = 0;
    const byBidang = {
      'Bina Marga': 0,
      'SDA BK': 0,
      'Cipta Karya': 0,
      'Tata Ruang': 0
    };

    pekerjaan.forEach(p => {
      const b = (p.anggaran_tahun && p.anggaran_tahun[yr]) || 0;
      if (b > 0) {
        budgetTotal += b;
        countTotal++;
        if (byBidang[p.bidang] !== undefined) {
          byBidang[p.bidang] += b;
        }
      }
    });

    return {
      tahun: yr,
      total_anggaran: budgetTotal,
      jumlah_pekerjaan: countTotal,
      alokasi_bidang: byBidang
    };
  });

  // Sebaran per Bidang
  const bidangList = ['Bina Marga', 'SDA BK', 'Cipta Karya', 'Tata Ruang'];
  const sebaran_bidang = bidangList.map(b => {
    const projs = pekerjaan.filter(p => p.bidang === b);
    const sum = projs.reduce((acc, p) => acc + (p.kebutuhan_anggaran || 0), 0);
    return {
      bidang: b,
      jumlah: projs.length,
      total_anggaran: sum
    };
  });

  // Sebaran Prioritas
  const sebaran_prioritas = [1, 2, 3].map(prio => {
    const projs = pekerjaan.filter(p => p.prioritas === prio);
    return {
      prioritas: `Prioritas ${prio}`,
      jumlah: projs.length,
      total_anggaran: projs.reduce((acc, p) => acc + (p.kebutuhan_anggaran || 0), 0)
    };
  });

  res.json({
    success: true,
    data: {
      total_pekerjaan,
      total_anggaran,
      panjang_total_jalan_km: 909.58,
      kemantapan_persen: 88.57,
      sebaran_kecamatan,
      sebaran_tahun,
      sebaran_bidang,
      sebaran_prioritas
    }
  });
});

// ==========================================
// 7. USER MANAGEMENT (SUPERADMIN ONLY)
// ==========================================
app.get('/api/users', authenticateToken, requireRole('superadmin', 'kepala dinas', 'sekretaris dinas'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  // Strip password hash from response
  const sanitized = users.map(u => ({
    id: u.id,
    username: u.username,
    nama: u.nama,
    nip: u.nip,
    role: u.role,
    bidang: u.bidang,
    jabatan: u.jabatan,
    telepon: u.telepon,
    status: u.status || 'Aktif',
    passwordPlain: req.user.role === 'Superadmin' ? u.passwordPlain : undefined
  }));
  res.json({ success: true, data: sanitized });
});

app.post('/api/users', authenticateToken, requireRole('superadmin'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const { username, password, nama, nip, role, bidang, jabatan, telepon } = req.body;

  if (!username || !password || !nama || !role) {
    return res.status(400).json({ success: false, message: 'Username, password, nama, dan role wajib diisi.' });
  }

  // Check unique username
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh akun lain.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username: username.toLowerCase().trim(),
    nama,
    nip: nip || '-',
    role,
    bidang: bidang || 'Semua',
    jabatan: jabatan || role,
    telepon: telepon || '-',
    status: 'Aktif',
    passwordPlain: password,
    password: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);
  syncUserToDb('save', newUser);

  res.status(201).json({
    success: true,
    message: 'Pengguna baru berhasil ditambahkan.',
    data: {
      id: newUser.id,
      username: newUser.username,
      nama: newUser.nama,
      role: newUser.role,
      bidang: newUser.bidang
    }
  });
});

app.put('/api/users/:id', authenticateToken, requireRole('superadmin'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  const current = users[index];
  const { username, password, nama, nip, role, bidang, jabatan, telepon, status } = req.body;

  // Check username uniqueness if changed
  if (username && username.toLowerCase() !== current.username.toLowerCase()) {
    if (users.some(u => u.id !== current.id && u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh akun lain.' });
    }
  }

  let updatedPassword = current.password;
  let updatedPlain = current.passwordPlain;
  if (password && password.trim() !== '') {
    updatedPassword = bcrypt.hashSync(password, 10);
    updatedPlain = password;
  }

  const updatedUser = {
    ...current,
    username: username ? username.toLowerCase().trim() : current.username,
    nama: nama || current.nama,
    nip: nip !== undefined ? nip : current.nip,
    role: role || current.role,
    bidang: bidang || current.bidang,
    jabatan: jabatan || current.jabatan,
    telepon: telepon !== undefined ? telepon : current.telepon,
    status: status || current.status,
    password: updatedPassword,
    passwordPlain: updatedPlain,
    updated_at: new Date().toISOString()
  };

  users[index] = updatedUser;
  writeJSON(USERS_FILE, users);
  syncUserToDb('save', updatedUser);

  res.json({
    success: true,
    message: 'Data pengguna berhasil diperbarui.',
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      nama: updatedUser.nama,
      role: updatedUser.role,
      bidang: updatedUser.bidang,
      status: updatedUser.status
    }
  });
});

app.delete('/api/users/:id', authenticateToken, requireRole('superadmin'), (req, res) => {
  const users = readJSON(USERS_FILE, []);
  const userToDelete = users.find(u => u.id === req.params.id);

  if (!userToDelete) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  }

  // Prevent deleting currently logged-in superadmin
  if (userToDelete.username === req.user.username) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif.' });
  }

  const filtered = users.filter(u => u.id !== req.params.id);
  writeJSON(USERS_FILE, filtered);
  syncUserToDb('delete', userToDelete);

  res.json({ success: true, message: `Akun ${userToDelete.nama} (${userToDelete.username}) berhasil dihapus.` });
});

// Fallback to index.html for SPA client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` SIREN - Sistem Perencanaan Terintegrasi Kab. Demak `);
  console.log(` Server berjalan di port: ${PORT}`);
  console.log(` Akses: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
