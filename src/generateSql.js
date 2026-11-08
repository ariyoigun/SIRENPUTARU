// src/generateSql.js
// Generates database_siren.sql for importing into phpMyAdmin
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(__dirname, '..', 'database_siren.sql');

const users = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
const kecamatan = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'kecamatan.json'), 'utf8'));
const pekerjaan = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pekerjaan.json'), 'utf8'));
const cms = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'cms_texts.json'), 'utf8'));
const tahun = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tahun.json'), 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

let sql = `-- ========================================================
-- SIREN - SISTEM PERENCANAAN TERINTEGRASI KABUPATEN DEMAK
-- DINAS PEKERJAAN UMUM DAN PENATAAN RUANG (DINPUTARU)
-- Database Name: u490770675_siren
-- Dibuat Otomatis untuk phpMyAdmin / MySQL
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Struktur dari tabel \`users\`
--
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`password_plain\` VARCHAR(100) DEFAULT NULL,
  \`nama\` VARCHAR(200) NOT NULL,
  \`nip\` VARCHAR(50) DEFAULT NULL,
  \`role\` VARCHAR(100) NOT NULL,
  \`bidang\` VARCHAR(100) NOT NULL,
  \`jabatan\` VARCHAR(255) DEFAULT NULL,
  \`telepon\` VARCHAR(50) DEFAULT NULL,
  \`status\` VARCHAR(20) DEFAULT 'Aktif',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel \`users\`
--
`;

users.forEach(u => {
  sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`password_plain\`, \`nama\`, \`nip\`, \`role\`, \`bidang\`, \`jabatan\`, \`telepon\`, \`status\`) VALUES (${escapeSql(u.id)}, ${escapeSql(u.username)}, ${escapeSql(u.password)}, ${escapeSql(u.passwordPlain)}, ${escapeSql(u.nama)}, ${escapeSql(u.nip)}, ${escapeSql(u.role)}, ${escapeSql(u.bidang)}, ${escapeSql(u.jabatan)}, ${escapeSql(u.telepon)}, ${escapeSql(u.status || 'Aktif')});\n`;
});

sql += `\n-- --------------------------------------------------------\n`;
sql += `--
-- Struktur dari tabel \`kecamatan\`
--
DROP TABLE IF EXISTS \`kecamatan\`;
CREATE TABLE \`kecamatan\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`ibu_kota\` VARCHAR(100) DEFAULT NULL,
  \`luas_km2\` DECIMAL(10,2) DEFAULT NULL,
  \`jumlah_desa\` INT DEFAULT NULL,
  \`lat\` DECIMAL(10,6) DEFAULT NULL,
  \`lng\` DECIMAL(10,6) DEFAULT NULL,
  \`warna\` VARCHAR(20) DEFAULT NULL,
  \`deskripsi\` TEXT,
  \`polygon_json\` LONGTEXT,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel \`kecamatan\`
--
`;

kecamatan.forEach(k => {
  sql += `INSERT INTO \`kecamatan\` (\`id\`, \`nama\`, \`ibu_kota\`, \`luas_km2\`, \`jumlah_desa\`, \`lat\`, \`lng\`, \`warna\`, \`deskripsi\`, \`polygon_json\`) VALUES (${escapeSql(k.id)}, ${escapeSql(k.nama)}, ${escapeSql(k.ibu_kota)}, ${escapeSql(k.luas_km2)}, ${escapeSql(k.jumlah_desa)}, ${escapeSql(k.lat)}, ${escapeSql(k.lng)}, ${escapeSql(k.warna)}, ${escapeSql(k.deskripsi)}, ${escapeSql(k.polygon)});\n`;
});

sql += `\n-- --------------------------------------------------------\n`;
sql += `--
-- Struktur dari tabel \`tahun_anggaran\`
--
DROP TABLE IF EXISTS \`tahun_anggaran\`;
CREATE TABLE \`tahun_anggaran\` (
  \`id\` INT AUTO_INCREMENT NOT NULL,
  \`tahun\` VARCHAR(10) NOT NULL UNIQUE,
  \`is_active\` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel \`tahun_anggaran\`
--
`;

tahun.forEach(t => {
  sql += `INSERT INTO \`tahun_anggaran\` (\`tahun\`, \`is_active\`) VALUES (${escapeSql(t)}, 1);\n`;
});

sql += `\n-- --------------------------------------------------------\n`;
sql += `--
-- Struktur dari tabel \`pekerjaan\`
--
DROP TABLE IF EXISTS \`pekerjaan\`;
CREATE TABLE \`pekerjaan\` (
  \`id\` VARCHAR(100) NOT NULL,
  \`bidang\` VARCHAR(100) NOT NULL,
  \`sub_bidang\` VARCHAR(100) DEFAULT NULL,
  \`nama_pekerjaan\` VARCHAR(255) NOT NULL,
  \`ruas\` VARCHAR(255) DEFAULT NULL,
  \`kecamatan\` VARCHAR(255) NOT NULL,
  \`panjang_total_km\` DECIMAL(10,3) DEFAULT 0,
  \`panjang_m\` DECIMAL(10,2) DEFAULT 0,
  \`rusak_ringan_km\` DECIMAL(10,3) DEFAULT 0,
  \`rusak_berat_km\` DECIMAL(10,3) DEFAULT 0,
  \`kondisi\` VARCHAR(50) DEFAULT NULL,
  \`status_mantap\` VARCHAR(50) DEFAULT NULL,
  \`kebutuhan_anggaran\` BIGINT DEFAULT 0,
  \`prioritas\` INT DEFAULT 2,
  \`anggaran_tahun_json\` LONGTEXT,
  \`lat\` DECIMAL(10,6) DEFAULT NULL,
  \`lng\` DECIMAL(10,6) DEFAULT NULL,
  \`keterangan\` TEXT,
  \`status\` VARCHAR(50) DEFAULT 'Direncanakan',
  \`created_by\` VARCHAR(100) DEFAULT 'system',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_bidang\` (\`bidang\`),
  KEY \`idx_kecamatan\` (\`kecamatan\`),
  KEY \`idx_prioritas\` (\`prioritas\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel \`pekerjaan\`
--
`;

pekerjaan.forEach(p => {
  sql += `INSERT INTO \`pekerjaan\` (\`id\`, \`bidang\`, \`sub_bidang\`, \`nama_pekerjaan\`, \`ruas\`, \`kecamatan\`, \`panjang_total_km\`, \`panjang_m\`, \`rusak_ringan_km\`, \`rusak_berat_km\`, \`kondisi\`, \`status_mantap\`, \`kebutuhan_anggaran\`, \`prioritas\`, \`anggaran_tahun_json\`, \`lat\`, \`lng\`, \`keterangan\`, \`status\`, \`created_by\`) VALUES (${escapeSql(p.id)}, ${escapeSql(p.bidang)}, ${escapeSql(p.sub_bidang)}, ${escapeSql(p.nama_pekerjaan)}, ${escapeSql(p.ruas)}, ${escapeSql(p.kecamatan)}, ${escapeSql(p.panjang_total_km || 0)}, ${escapeSql(p.panjang_m || 0)}, ${escapeSql(p.rusak_ringan_km || 0)}, ${escapeSql(p.rusak_berat_km || 0)}, ${escapeSql(p.kondisi || null)}, ${escapeSql(p.status_mantap || null)}, ${escapeSql(p.kebutuhan_anggaran || 0)}, ${escapeSql(p.prioritas || 2)}, ${escapeSql(p.anggaran_tahun || {})}, ${escapeSql(p.lat)}, ${escapeSql(p.lng)}, ${escapeSql(p.keterangan || '')}, ${escapeSql(p.status || 'Direncanakan')}, ${escapeSql(p.created_by || 'system')});\n`;
});

sql += `\n-- --------------------------------------------------------\n`;
sql += `--
-- Struktur dari tabel \`cms_texts\`
--
DROP TABLE IF EXISTS \`cms_texts\`;
CREATE TABLE \`cms_texts\` (
  \`text_key\` VARCHAR(100) NOT NULL,
  \`text_value\` TEXT,
  PRIMARY KEY (\`text_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel \`cms_texts\`
--
`;

for (const [k, v] of Object.entries(cms)) {
  sql += `INSERT INTO \`cms_texts\` (\`text_key\`, \`text_value\`) VALUES (${escapeSql(k)}, ${escapeSql(v)});\n`;
}

sql += `\nCOMMIT;\n
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
`;

fs.writeFileSync(OUT_FILE, sql, 'utf8');
console.log(`[SQL Generator] File berhasil dibuat: database_siren.sql (${(sql.length / 1024).toFixed(1)} KB)`);
