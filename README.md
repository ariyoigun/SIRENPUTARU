# SIREN - Sistem Perencanaan Terintegrasi Kabupaten Demak
**Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU) Kabupaten Demak**

Aplikasi sistem informasi perencanaan terintegrasi berbasis Geospasial (GIS / Google Maps API) yang mengintegrasikan seluruh perencanaan pembangunan infrastruktur fisik Kabupaten Demak dari tahun anggaran 2027 hingga 2031 dan seterusnya (dinamis).

Repository GitHub: [https://github.com/ariyoigun/SIRENPUTARU.git](https://github.com/ariyoigun/SIRENPUTARU.git)

---

## 🌟 Fitur Utama Sistem

### 1. Halaman Muka / Publik (GIS Spasial Interaktif)
- **Peta Interaktif Kabupaten Demak**: Visualisasi batas asli 14 kecamatan (Demak, Sayung, Mranggen, Karangawen, Guntur, Karangtengah, Bonang, Wedung, Mijen, Karanganyar, Gajah, Wonosalam, Dempet, Kebonagung) menggunakan Google Maps API (`AIzaSyCyhRYSklF6pnYBmtg2BJp4oCi_Ux3_Esg`).
- **Interaksi Wilayah**: Klik pada batas kecamatan di peta atau gunakan dropdown untuk memfokuskan wilayah dan memunculkan pin titik perencanaan pekerjaan di kecamatan tersebut.
- **Filter Tahun Anggaran**: Dinamis mulai dari 2027 s/d 2031+ dengan tombol filter tahun.
- **Kategori Warna Pin Sesuai Bidang**:
  - 🔵 **Bina Marga**: Biru Royal (Peningkatan Jalan, Jembatan, Rekonstruksi, Pemeliharaan)
  - 🟢 **SDA BK**: Hijau / Teal (Rumah Pompa, Normalisasi Sungai/Afvour, Check Dam, Embung, Pintu Air, Tanggul, Drainase)
  - 🟣 **Cipta Karya**: Ungu (Air Minum SPAM, Sanitasi Kawasan, Bangunan Gedung Pemerintahan)
  - 🟡 **Tata Ruang (TRP)**: Kuning Emas (Rencana Detail Tata Ruang / RDTR, RTBL, Kawasan Lindung LP2B)
- **Kesesuaian Lokasi SDA BK**: Seluruh paket SDA BK telah dipetakan kecamatannya sesuai lokasi pekerjaan dan desa terkait.
- **Daftar Pekerjaan di Bawah Peta**: Menampilkan rincian paket yang sinkron dengan tahun dan kecamatan yang diklik.
- **Pencarian Cepat & Ekspor Data**: Fitur cari paket, ruas, atau desa, serta ekspor ke CSV/Excel.

### 2. Autentikasi Pengguna & Keamanan
- Tombol navigasi **Login** di header atas.
- **Login Modal Langsung**: Form langsung meminta Username, Password, dan verifikasi angka matematika anti-bot (CAPTCHA aritmatika sederhana dengan tombol Refresh).
- Role-Based Access Control (RBAC) dengan token JWT dan password terenkripsi bcrypt.

### 3. Dashboard Internal (Back End) - Desain Terang & Kontras Tinggi
- **Warna Dasar Putih (Light Theme)**: Seluruh panel internal menggunakan warna dasar putih dan abu-abu terang (`bg-white` / `bg-slate-50`) dengan teks kontras tinggi (`#0f172a` / `#1e293b`) agar semua teks, angka anggaran, dan tabel terlihat jelas dan mudah dibaca.
- **Infografis Sebaran Pekerjaan (3 Segmen Interaktif)**:
  - *Segmen 1*: Sebaran Anggaran & Pekerjaan per Kecamatan (Grafik Bar Anggaran Miliar Rp & Line Chart Titik Pekerjaan).
  - *Segmen 2*: Rencana Alokasi Anggaran Multi-Tahun per Bidang (Stacked Bar Chart).
  - *Segmen 3*: Komposisi per Bidang (Donut Chart).
- **Interaktivitas Grafik**: Mengklik batang kecamatan atau segmen bidang pada grafik akan langsung memfilter tabel data pekerjaan di bawahnya.
- **Kotak Pencarian Internal**: Kotak pencarian cepat pada rincian data pekerjaan internal.
- **Fitur Sortir (Urutkan Data)**:
  - Urutkan berdasarkan **Tahun Anggaran** (Terlama → Terbaru, atau sebaliknya).
  - Urutkan berdasarkan **Kecamatan** (A - Z).
  - Urutkan berdasarkan **Bidang Penyelenggara** (A - Z).
  - Urutkan berdasarkan **Nominal Anggaran** (Terbesar / Terkecil).
  - Urutkan berdasarkan **Prioritas** (Prioritas 1 → 3).
  - Header kolom tabel dapat diklik langsung untuk mengurutkan (sort) data.
- **Kategori Warna per Bidang**: Tabel pekerjaan diberi border kiri dan badge warna berbeda sesuai bidang.
- **Input & Edit Perencanaan**: Koordinator dan Kabid dapat menambah usulan pekerjaan baru lengkap dengan koordinat spasial, alokasi per tahun anggaran, dan catatan teknis.

### 4. Menu Khusus Super Admin
1. **Manajemen User (Pengguna Sistem)**:
   - Tambah, edit, hapus akun, reset password, serta atur peran (Superadmin, Kepala Dinas, Sekretaris Dinas, Kabid, Koordinator, Kasubag) dan bidang penugasan.
2. **Manajemen Teks (CMS Terintegrasi)**:
   - Mengatur semua teks di halaman publik dan internal secara fleksibel (Judul, Sub-judul, Deskripsi SIREN, Petunjuk Peta, Kontak, Jam Layanan, Hak Cipta) tanpa menyentuh kode.
3. **Manajemen Tahun Perencanaan**:
   - Menu khusus untuk menambah tahun anggaran baru di masa depan (contoh: `2032`, `2033`, dst.).
   - Penambahan tahun baru secara otomatis memperluas matriks perencanaan di seluruh filter publik, filter internal, grafik multi-tahun, dan form input pekerjaan.
4. **Pengaturan & Cek Koneksi Database (MySQL Dual-Storage)**:
   - Tombol **"Cek / Tes Koneksi Database"** langsung ke server database MySQL.
   - Form konfigurasi koneksi database:
     - **Host**: `siren.satuputarudemak.id`
     - **Port**: `3306`
     - **Database**: `u490770675_siren`
     - **User**: `u490770675_adminsiren`
     - **Password**: `*Demak2026`
   - Tombol **"Unduh File SQL (database_siren.sql)"** siap diimpor di phpMyAdmin.
   - **Sinkronisasi Otomatis**: Setiap penambahan, pengubahan, atau penghapusan data di web otomatis langsung dieksekusi dan disimpan permanen di database MySQL.

---

## 🗄️ Database & Panduan phpMyAdmin

File dump SQL siap impor tersedia di root folder:
📁 `database_siren.sql` (Ukuran ~177 KB)

### Struktur Tabel yang Disediakan:
1. `users` : Data akun ASN, NIP, role, bidang, dan hash password.
2. `pekerjaan` : 230+ paket pekerjaan fisik dengan alokasi multi-tahun (2027 s/d 2031+), koordinat spasial (lat, lng), ruas jalan/sungai, dan prioritas.
3. `kecamatan` : 14 kecamatan di Kabupaten Demak lengkap dengan koordinat polygon batas wilayah.
4. `tahun_anggaran` : Master data tahun anggaran perencanaan dinamis.
5. `cms_texts` : Pengaturan teks sistem yang dapat diubah melalui menu CMS.

### Langkah Impor ke phpMyAdmin:
1. Buka panel cPanel / Hostinger dan masuk ke **phpMyAdmin**.
2. Pilih database `u490770675_siren`.
3. Klik tab **Import** di menu atas.
4. Pilih file `database_siren.sql` lalu klik **Go / Kirim**.
5. Database telah terisi lengkap dan siap digunakan.

---

## 👥 Daftar Akun & Hak Akses (Sesuai Excel)

| No | Nama Pegawai | NIP | Username | Password | Role / Jabatan | Bidang |
|---|---|---|---|---|---|---|
| 1 | Ir. NANANG TASUNAR DAVID NARUTOMO, MM | 196702101993031009 | `kadin.dinputaru` | `*Dinput4ru_01` | Kepala Dinas | Semua |
| 2 | NANING PRIH HATININGRUM, S.IP,M.Si | 197801082010012019 | `sekdin.dinputaru` | `*Dinput4ru_02` | Sekretaris Dinas | Semua |
| 3 | BAGAS SATRIA ANGGRIAWAN, S.T., M.M. | 199106122015021002 | `prokeu.dinputaru` | `*Dinput4ru_03` | Kasubag Program Keuangan | Sekretariat |
| 4 | BAGAS SATRIA ANGGRIAWAN, S.T., M.M. | 199106122015021002 | `umpeg.dinputaru` | `*Dinput4ru_04` | Kasubag Umum Kepegawaian | Sekretariat |
| 5 | RIZKY PRAHARDINI, S.E. | 198607282025212082 | `koor.sekre1` | `*Dinput4ru_05` | Koordinator Sekretariat | Sekretariat |
| 6 | RANI NURHAYATI, S.Sos | 199707102025212091 | `koor.sekre2` | `*Dinput4ru_06` | Koordinator Sekretariat | Sekretariat |
| 7 | **GUNARIYO, S.Kom.** | 198909212025041001 | `superadmin` | `*Dinput4ru_07` | **Superadmin** | Semua |
| 8 | S. EKO WIDIANTORO, ST | 197506012010011012 | `kabid.bm` | `*Dinput4ru_08` | Kabid Bina Marga | Bina Marga |
| 9 | TIA ARYUNINGRUM, ST | 199406262020122025 | `koor.bm` | `*Dinput4ru_09` | Koordinator Bina Marga | Bina Marga |
| 10 | NANING PRIH HATININGRUM, S.IP,M.Si | 197801082010012019 | `kabid.sdabk` | `*Dinput4ru_10` | Kabid SDABK | SDA BK |
| 11 | RESI DIANSISMITA, S.T. | 199805242024212018 | `koor.sdabk` | `*Dinput4ru_11` | Koordinator SDABK | SDA BK |
| 12 | S. EKO WIDIANTORO, ST | 197506012010011012 | `kabid.trp` | `*Dinput4ru_12` | Plt. Kabid TRP | Tata Ruang |
| 13 | INSANIA MULIA JUNAEDI, S.T. | 200111212025042001 | `koor.trp` | `*Dinput4ru_13` | Koordinator TRP | Tata Ruang |
| 14 | ANDI ERWIN PRASETYO, ST. | 197209142003121002 | `kabid.ck` | `*Dinput4ru_14` | Kabid Cipta Karya | Cipta Karya |
| 15 | CHINTYA CAHYANINGRUM, S.T. | 200207052025042001 | `koor.ck` | `*Dinput4ru_15` | Koordinator Cipta Karya | Cipta Karya |

---

## 🚀 Panduan Menjalankan Sistem

1. Pastikan Node.js (versi 18+) terpasang.
2. Jalankan perintah instalasi dependency (jika belum):
   ```powershell
   npm install
   ```
3. Jalankan server:
   ```powershell
   npm start
   ```
   *Atau klik ganda file `start.bat`.*
4. Buka peramban (browser) dan akses:
   ```
   http://localhost:3000
   ```

---
Dibuat untuk Pemerintah Kabupaten Demak - Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU).
