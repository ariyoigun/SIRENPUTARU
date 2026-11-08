// src/db.js
// Database Connection Manager for SIREN Kabupaten Demak
// Supports MySQL (siren.satuputarudemak.id / phpMyAdmin) with fallback to JSON storage

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'db_config.json');

let pool = null;
let isConnected = false;
let lastError = null;

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Gagal membaca db_config.json:", err.message);
  }
  return {
    host: "siren.satuputarudemak.id",
    port: 3306,
    database: "u490770675_siren",
    user: "u490770675_adminsiren",
    password: "*Demak2026",
    enabled: true
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    initPool();
    return true;
  } catch (err) {
    console.error("Gagal menyimpan db_config.json:", err.message);
    return false;
  }
}

async function initPool() {
  const cfg = getConfig();
  if (pool) {
    try {
      await pool.end();
    } catch (e) {}
    pool = null;
  }

  if (!cfg.enabled) {
    isConnected = false;
    return;
  }

  try {
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port || 3306,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    lastError = null;
    console.log(`[Database] Terhubung ke MySQL Server: ${cfg.host} (Database: ${cfg.database})`);
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[Database] Tidak dapat terhubung ke MySQL (${err.message}). Menggunakan penyimpanan lokal JSON.`);
  }
}

// Test connection on demand with specific or stored parameters
async function testConnection(customConfig = null) {
  const cfg = customConfig || getConfig();
  const startTime = Date.now();

  try {
    const conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port || 3306,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 8000
    });

    await conn.ping();
    const [rows] = await conn.query('SELECT 1 as connected');
    await conn.end();

    const latency = Date.now() - startTime;
    return {
      success: true,
      message: `Koneksi berhasil! Terhubung ke server MySQL (${cfg.host}) database [${cfg.database}] dalam ${latency} ms.`,
      latency
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal terhubung ke MySQL (${cfg.host}:${cfg.port || 3306}): ${err.message}`,
      error: err.code || err.message
    };
  }
}

// Safe query execution
async function query(sql, params = []) {
  if (!pool || !isConnected) return null;
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error(`[MySQL Query Error]: ${err.message}`);
    return null;
  }
}

// Initial attempt
initPool();

module.exports = {
  getConfig,
  saveConfig,
  testConnection,
  initPool,
  query,
  isConnected: () => isConnected,
  getLastError: () => lastError
};
