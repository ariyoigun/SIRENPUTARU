// src/seedData.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. KECAMATAN DATA DENGAN KOORDINAT & BOUNDARY POLYGON
const kecamatanList = [
  {
    id: "demak",
    nama: "Demak",
    ibu_kota: "Bintoro",
    luas_km2: 38.69,
    jumlah_desa: 19,
    lat: -6.8944,
    lng: 110.6385,
    warna: "#1e40af", // Deep Blue
    deskripsi: "Pusat pemerintahan dan ibukota Kabupaten Demak, pusat perdagangan dan cagar budaya religi Masjid Agung Demak.",
    polygon: [
      [-6.865, 110.620], [-6.860, 110.655], [-6.885, 110.665], [-6.915, 110.658],
      [-6.920, 110.628], [-6.895, 110.615], [-6.865, 110.620]
    ]
  },
  {
    id: "karangtengah",
    nama: "Karangtengah",
    ibu_kota: "Wonokerto",
    luas_km2: 51.55,
    jumlah_desa: 17,
    lat: -6.9150,
    lng: 110.6050,
    warna: "#2563eb", // Royal Blue
    deskripsi: "Kecamatan penyangga barat ibukota, kawasan pertanian produktif, perikanan tambak, dan jalur penghubung antar-wilayah.",
    polygon: [
      [-6.890, 110.585], [-6.885, 110.625], [-6.920, 110.630], [-6.945, 110.620],
      [-6.940, 110.580], [-6.910, 110.575], [-6.890, 110.585]
    ]
  },
  {
    id: "sayung",
    nama: "Sayung",
    ibu_kota: "Sayung",
    luas_km2: 64.91,
    jumlah_desa: 20,
    lat: -6.9380,
    lng: 110.5100,
    warna: "#0284c7", // Sky Ocean
    deskripsi: "Pintu gerbang barat Demak berbatasan langsung dengan Kota Semarang, kawasan industri dan pesisir rawan banjir rob.",
    polygon: [
      [-6.900, 110.470], [-6.890, 110.535], [-6.925, 110.550], [-6.960, 110.540],
      [-6.975, 110.490], [-6.940, 110.465], [-6.900, 110.470]
    ]
  },
  {
    id: "mranggen",
    nama: "Mranggen",
    ibu_kota: "Mranggen",
    luas_km2: 72.22,
    jumlah_desa: 19,
    lat: -7.0250,
    lng: 110.5150,
    warna: "#0369a1", // Deep Cyan Blue
    deskripsi: "Kecamatan terpadat di Kabupaten Demak, kawasan permukiman perkotaan mandiri dan pusat pendidikan keagamaan besar.",
    polygon: [
      [-6.980, 110.485], [-6.970, 110.545], [-7.015, 110.555], [-7.060, 110.530],
      [-7.065, 110.490], [-7.020, 110.475], [-6.980, 110.485]
    ]
  },
  {
    id: "karangawen",
    nama: "Karangawen",
    ibu_kota: "Brambang",
    luas_km2: 66.95,
    jumlah_desa: 12,
    lat: -7.0500,
    lng: 110.5650,
    warna: "#1d4ed8", // Indigo Blue
    deskripsi: "Kecamatan di perbatasan selatan, lintasan jalan nasional Semarang - Purwodadi, sentra agraris dan pergudangan.",
    polygon: [
      [-7.010, 110.545], [-7.000, 110.590], [-7.045, 110.605], [-7.090, 110.580],
      [-7.085, 110.540], [-7.040, 110.540], [-7.010, 110.545]
    ]
  },
  {
    id: "guntur",
    nama: "Guntur",
    ibu_kota: "Guntur",
    luas_km2: 57.53,
    jumlah_desa: 20,
    lat: -6.9850,
    lng: 110.5850,
    warna: "#312e81", // Dark Slate Blue
    deskripsi: "Sentra pertanian subur dan perkebunan hortikultura unggulan di bagian tengah Kabupaten Demak.",
    polygon: [
      [-6.950, 110.555], [-6.940, 110.615], [-6.995, 110.625], [-7.015, 110.585],
      [-7.000, 110.550], [-6.970, 110.545], [-6.950, 110.555]
    ]
  },
  {
    id: "wonosalam",
    nama: "Wonosalam",
    ibu_kota: "Pilangsari",
    luas_km2: 57.88,
    jumlah_desa: 21,
    lat: -6.9100,
    lng: 110.6800,
    warna: "#1e3a8a", // Navy
    deskripsi: "Kawasan timur ibukota Demak, dilalui jalan lingkar dan jalur primer Demak - Godong.",
    polygon: [
      [-6.880, 110.655], [-6.870, 110.710], [-6.925, 110.720], [-6.945, 110.680],
      [-6.935, 110.645], [-6.900, 110.650], [-6.880, 110.655]
    ]
  },
  {
    id: "dempet",
    nama: "Dempet",
    ibu_kota: "Dempet",
    luas_km2: 61.61,
    jumlah_desa: 16,
    lat: -6.9600,
    lng: 110.7200,
    warna: "#0f766e", // Dark Teal
    deskripsi: "Kecamatan agraris strategis di tenggara Demak, pusat lumbung pangan dan jalur interkoneksi ke Grobogan.",
    polygon: [
      [-6.930, 110.690], [-6.920, 110.755], [-6.975, 110.765], [-7.000, 110.715],
      [-6.985, 110.680], [-6.950, 110.685], [-6.930, 110.690]
    ]
  },
  {
    id: "kebonagung",
    nama: "Kebonagung",
    ibu_kota: "Kebonagung",
    luas_km2: 41.99,
    jumlah_desa: 14,
    lat: -7.0100,
    lng: 110.7400,
    warna: "#047857", // Deep Emerald
    deskripsi: "Wilayah selatan ujung timur, perbatasan langsung dengan Kabupaten Grobogan, kawasan bendung dan irigasi klampok.",
    polygon: [
      [-6.980, 110.715], [-6.970, 110.770], [-7.025, 110.785], [-7.050, 110.740],
      [-7.035, 110.705], [-6.995, 110.705], [-6.980, 110.715]
    ]
  },
  {
    id: "gajah",
    nama: "Gajah",
    ibu_kota: "Gajah",
    luas_km2: 47.83,
    jumlah_desa: 18,
    lat: -6.8950,
    lng: 110.7700,
    warna: "#059669", // Emerald
    deskripsi: "Sentra pertanian padi modern, sentra kerajinan dan perdagangan di koridor timur Demak.",
    polygon: [
      [-6.865, 110.740], [-6.855, 110.805], [-6.910, 110.815], [-6.935, 110.765],
      [-6.920, 110.730], [-6.885, 110.730], [-6.865, 110.740]
    ]
  },
  {
    id: "karanganyar",
    nama: "Karanganyar",
    ibu_kota: "Karanganyar",
    luas_km2: 51.55,
    jumlah_desa: 17,
    lat: -6.8650,
    lng: 110.7950,
    warna: "#0d9488", // Teal
    deskripsi: "Gerbang timur Kabupaten Demak yang berbatasan langsung dengan Kabupaten Kudus di Sungai Wulan.",
    polygon: [
      [-6.830, 110.765], [-6.820, 110.835], [-6.875, 110.840], [-6.905, 110.800],
      [-6.890, 110.760], [-6.850, 110.760], [-6.830, 110.765]
    ]
  },
  {
    id: "mijen",
    nama: "Mijen",
    ibu_kota: "Mijen",
    luas_km2: 50.29,
    jumlah_desa: 15,
    lat: -6.8050,
    lng: 110.7100,
    warna: "#0891b2", // Cyan Blue
    deskripsi: "Kawasan perbatasan utara timur, agribisnis semangka dan melon serta perikanan darat.",
    polygon: [
      [-6.770, 110.675], [-6.760, 110.745], [-6.820, 110.760], [-6.845, 110.710],
      [-6.830, 110.675], [-6.790, 110.670], [-6.770, 110.675]
    ]
  },
  {
    id: "wedung",
    nama: "Wedung",
    ibu_kota: "Wedung",
    luas_km2: 98.76,
    jumlah_desa: 20,
    lat: -6.7800,
    lng: 110.5900,
    warna: "#2563eb", // Blue
    deskripsi: "Kecamatan terluas di Kabupaten Demak, kawasan pesisir utara dengan tambak garam, bandeng, dan hutan mangrove.",
    polygon: [
      [-6.730, 110.540], [-6.720, 110.640], [-6.790, 110.665], [-6.830, 110.620],
      [-6.825, 110.560], [-6.760, 110.535], [-6.730, 110.540]
    ]
  },
  {
    id: "bonang",
    nama: "Bonang",
    ibu_kota: "Morangsan",
    luas_km2: 73.24,
    jumlah_desa: 21,
    lat: -6.8400,
    lng: 110.5850,
    warna: "#1e3a8a", // Dark Blue
    deskripsi: "Kawasan maritim dan perikanan tangkap terbesar, Pelabuhan Perikanan Pantai Morodemak.",
    polygon: [
      [-6.800, 110.545], [-6.790, 110.625], [-6.855, 110.635], [-6.885, 110.590],
      [-6.875, 110.545], [-6.825, 110.535], [-6.800, 110.545]
    ]
  }
];

function detectKecamatan(text) {
  if (!text) return "Demak";
  const upper = text.toUpperCase();
  for (const kec of kecamatanList) {
    if (upper.includes(kec.nama.toUpperCase())) {
      return kec.nama;
    }
  }
  if (upper.includes("TAMBAKROTO") || upper.includes("PRAMPELAN") || upper.includes("BEDONO") || upper.includes("SRIWULAN") || upper.includes("TIMBULSLOKO") || upper.includes("GEMULAK") || upper.includes("PURWOSARI") || upper.includes("KARANGASEM") || upper.includes("BANJARSARI")) return "Sayung";
  if (upper.includes("BATURSARI") || upper.includes("KEBONBATUR") || upper.includes("WRINGINJAJAR") || upper.includes("MENUR") || upper.includes("JAMUS") || upper.includes("BANYUMENENG") || upper.includes("PUCANG GADING")) return "Mranggen";
  if (upper.includes("BRAMBANG") || upper.includes("JRAGUNG") || upper.includes("WONOSEKAR") || upper.includes("MARGOHAYU") || upper.includes("KANGKUNG") || upper.includes("TELUK")) return "Karangawen";
  if (upper.includes("BLERONG") || upper.includes("BAKALREJO") || upper.includes("TEMUROSO") || upper.includes("BOGOSARI") || upper.includes("KRANDON") || upper.includes("PAMONGAN") || upper.includes("SIDOKUMPUL")) return "Guntur";
  if (upper.includes("WONOKERTO") || upper.includes("DUKUN") || upper.includes("KLITIH") || upper.includes("REJOSARI") || upper.includes("WONOAGUNG") || upper.includes("SAMPANG") || upper.includes("BATU")) return "Karangtengah";
  if (upper.includes("MORODEMAK") || upper.includes("BETAHWALANG") || upper.includes("GEBANG") || upper.includes("PURWOREJO") || upper.includes("SERANGAN") || upper.includes("SUKODONO") || upper.includes("JATIROGO") || upper.includes("TRIDONOREJO")) return "Bonang";
  if (upper.includes("TEDUNAN") || upper.includes("MENCO") || upper.includes("MUTIHKULON") || upper.includes("MUTIHWETAN") || upper.includes("JUNGPASIR") || upper.includes("JETAK") || upper.includes("BUKO") || upper.includes("SEKLENTING")) return "Wedung";
  if (upper.includes("PECUK") || upper.includes("MLATEN") || upper.includes("JLEPER") || upper.includes("NGELOKULON") || upper.includes("PASIR")) return "Mijen";
  if (upper.includes("CANGKRING") || upper.includes("WONOREJO") || upper.includes("KETANJUNG") || upper.includes("JATIREJO") || upper.includes("BANDUNGREJO") || upper.includes("KEDUNGWARU")) return "Karanganyar";
  if (upper.includes("SAMBUNG") || upper.includes("MLATIHARJO") || upper.includes("TAMBIREJO") || upper.includes("GEDANGALAS") || upper.includes("MEDINI") || upper.includes("BOYOLALI")) return "Gajah";
  if (upper.includes("TRENGGULI") || upper.includes("KUNCIR") || upper.includes("KENDALDOYONG") || upper.includes("PILANGREJO") || upper.includes("KARANGROWO") || upper.includes("DORENG") || upper.includes("MOJODEMAK")) return "Wonosalam";
  if (upper.includes("KRAMAT") || upper.includes("BALEROMO") || upper.includes("KUNIR") || upper.includes("BOTOSENGON") || upper.includes("KEDUNGORI") || upper.includes("KUWU") || upper.includes("BRAKAS")) return "Dempet";
  if (upper.includes("MEGONTEN") || upper.includes("WERDOYO") || upper.includes("MANGUNREJO") || upper.includes("SOLOWIRE") || upper.includes("TLOGOSIH") || upper.includes("BABAT") || upper.includes("MANGUNAN")) return "Kebonagung";
  return "Demak";
}

// 2. USERS
const usersList = [
  {
    id: "user-1",
    username: "kadin.dinputaru",
    nama: "Ir. NANANG TASUNAR DAVID NARUTOMO, MM",
    nip: "196702101993031009",
    role: "Kepala Dinas",
    bidang: "Semua",
    jabatan: "Kepala Dinas Pekerjaan Umum dan Penataan Ruang",
    telepon: "08123456701",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_01"
  },
  {
    id: "user-2",
    username: "sekdin.dinputaru",
    nama: "NANING PRIH HATININGRUM, S.IP,M.Si",
    nip: "197801082010012019",
    role: "Sekretaris Dinas",
    bidang: "Semua",
    jabatan: "Sekretaris Dinas PUPR",
    telepon: "08123456702",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_02"
  },
  {
    id: "user-3",
    username: "prokeu.dinputaru",
    nama: "BAGAS SATRIA ANGGRIAWAN, S.T., M.M.",
    nip: "199106122015021002",
    role: "Kasubag Program Keuangan",
    bidang: "Sekretariat",
    jabatan: "Kasubag Program Keuangan",
    telepon: "08123456703",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_03"
  },
  {
    id: "user-4",
    username: "umpeg.dinputaru",
    nama: "BAGAS SATRIA ANGGRIAWAN, S.T., M.M.",
    nip: "199106122015021002",
    role: "Kasubag Umum Kepegawaian",
    bidang: "Sekretariat",
    jabatan: "Kasubag Umum Kepegawaian",
    telepon: "08123456704",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_04"
  },
  {
    id: "user-5",
    username: "koor.sekre1",
    nama: "RIZKY PRAHARDINI, S.E.",
    nip: "198607282025212082",
    role: "Koordinator Sekretariat",
    bidang: "Sekretariat",
    jabatan: "Koordinator Sekretariat 1",
    telepon: "08123456705",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_05"
  },
  {
    id: "user-6",
    username: "koor.sekre2",
    nama: "RANI NURHAYATI, S.Sos",
    nip: "199707102025212091",
    role: "Koordinator Sekretariat",
    bidang: "Sekretariat",
    jabatan: "Koordinator Sekretariat 2",
    telepon: "08123456706",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_06"
  },
  {
    id: "user-7",
    username: "superadmin",
    nama: "GUNARIYO, S.Kom.",
    nip: "198909212025041001",
    role: "Superadmin",
    bidang: "Semua",
    jabatan: "Administrator Sistem SIREN",
    telepon: "08123456707",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_07"
  },
  {
    id: "user-8",
    username: "kabid.bm",
    nama: "S. EKO WIDIANTORO, ST",
    nip: "197506012010011012",
    role: "Kabid",
    bidang: "Bina Marga",
    jabatan: "Kabid Bina Marga",
    telepon: "08123456708",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_08"
  },
  {
    id: "user-9",
    username: "koor.bm",
    nama: "TIA ARYUNINGRUM, ST",
    nip: "199406262020122025",
    role: "Koordinator",
    bidang: "Bina Marga",
    jabatan: "Koordinator Bina Marga",
    telepon: "08123456709",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_09"
  },
  {
    id: "user-10",
    username: "kabid.sdabk",
    nama: "NANING PRIH HATININGRUM, S.IP,M.Si",
    nip: "197801082010012019",
    role: "Kabid",
    bidang: "SDA BK",
    jabatan: "Kabid Sumber Daya Air dan Bina Konstruksi",
    telepon: "08123456710",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_10"
  },
  {
    id: "user-11",
    username: "koor.sdabk",
    nama: "RESI DIANSISMITA, S.T.",
    nip: "199805242024212018",
    role: "Koordinator",
    bidang: "SDA BK",
    jabatan: "Koordinator SDABK",
    telepon: "08123456711",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_11"
  },
  {
    id: "user-12",
    username: "kabid.trp",
    nama: "S. EKO WIDIANTORO, ST",
    nip: "197506012010011012",
    role: "Kabid",
    bidang: "Tata Ruang",
    jabatan: "Plt. Kabid Tata Ruang dan Pertanahan",
    telepon: "08123456712",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_12"
  },
  {
    id: "user-13",
    username: "koor.trp",
    nama: "INSANIA MULIA JUNAEDI, S.T.",
    nip: "200111212025042001",
    role: "Koordinator",
    bidang: "Tata Ruang",
    jabatan: "Koordinator TRP",
    telepon: "08123456713",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_13"
  },
  {
    id: "user-14",
    username: "kabid.ck",
    nama: "ANDI ERWIN PRASETYO, ST.",
    nip: "197209142003121002",
    role: "Kabid",
    bidang: "Cipta Karya",
    jabatan: "Kabid Cipta Karya",
    telepon: "08123456714",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_14"
  },
  {
    id: "user-15",
    username: "koor.ck",
    nama: "CHINTYA CAHYANINGRUM, S.T.",
    nip: "200207052025042001",
    role: "Koordinator",
    bidang: "Cipta Karya",
    jabatan: "Koordinator Cipta Karya",
    telepon: "08123456715",
    status: "Aktif",
    passwordPlain: "*Dinput4ru_15"
  }
];

const hashedUsers = usersList.map(u => ({
  ...u,
  password: bcrypt.hashSync(u.passwordPlain, 10)
}));

// 3. ROADS WITH DETAILED PLANNING
const rawRoads = [
  { no: 1, nama: "Jalan Dempet - Mintreng", kec: "Dempet, Kebonagung", pj: 6.947, rr: 3.116, rb: 1.339, tot: 6503500000, prio: 1, y27: 2000000000, y28: 2503500000, y29: 2000000000, y30: 0, y31: 0, lat: -6.972, lng: 110.730 },
  { no: 2, nama: "Jalan Demak - Purworejo", kec: "Demak, Bonang", pj: 14.106, rr: 0.520, rb: 1.443, tot: 12247300000, prio: 2, y27: 2000000000, y28: 2000000000, y29: 2000000000, y30: 2500000000, y31: 3747300000, lat: -6.862, lng: 110.608 },
  { no: 3, nama: "Jalan Gajah - Dempet", kec: "Gajah, Dempet", pj: 10.526, rr: 1.426, rb: 0.200, tot: 6910100000, prio: 3, y27: 1500000000, y28: 1500000000, y29: 1500000000, y30: 2410100000, y31: 0, lat: -6.925, lng: 110.745 },
  { no: 4, nama: "Jalan Karanganyar - Merak", kec: "Karanganyar, Gajah, Dempet", pj: 20.217, rr: 0.400, rb: 0.178, tot: 2536800000, prio: 4, y27: 1500000000, y28: 1036800000, y29: 0, y30: 0, y31: 0, lat: -6.885, lng: 110.780 },
  { no: 5, nama: "Jalan Onggorawe - Mranggen", kec: "Sayung, Mranggen", pj: 11.769, rr: 0.211, rb: 0.200, tot: 2232350000, prio: 5, y27: 1500000000, y28: 732350000, y29: 0, y30: 0, y31: 0, lat: -6.980, lng: 110.518 },
  { no: 6, nama: "Jalan gojoyo - Ruwit", kec: "Wedung", pj: 4.866, rr: 0, rb: 2.916, tot: 20703600000, prio: 6, y27: 1000000000, y28: 1500000000, y29: 1500000000, y30: 2000000000, y31: 2500000000, lat: -6.795, lng: 110.605 },
  { no: 7, nama: "Jalan Cangkring - Karangrejo", kec: "Karanganyar, Gajah, Dempet", pj: 11.434, rr: 1.394, rb: 0, tot: 5366900000, prio: 7, y27: 1000000000, y28: 1500000000, y29: 1500000000, y30: 1366900000, y31: 0, lat: -6.890, lng: 110.750 },
  { no: 8, nama: "Jalan Kudus - Demak (Pati Unus)", kec: "Demak", pj: 1.891, rr: 0.600, rb: 0, tot: 2310000000, prio: 8, y27: 1000000000, y28: 1310000000, y29: 0, y30: 0, y31: 0, lat: -6.885, lng: 110.648 },
  { no: 9, nama: "Jalan Sultan Fatah", kec: "Demak", pj: 2.309, rr: 0.100, rb: 0, tot: 385000000, prio: 9, y27: 385000000, y28: 0, y29: 0, y30: 0, y31: 0, lat: -6.893, lng: 110.639 },
  { no: 10, nama: "Jalan Trengguli - Demung", kec: "Wonosalam", pj: 7.358, rr: 3.255, rb: 0.545, tot: 16401250000, prio: 10, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 2000000000, y31: 2500000000, lat: -6.905, lng: 110.675 },
  { no: 11, nama: "Jalan Sunan Kalijaga", kec: "Demak", pj: 2.240, rr: 0.100, rb: 0, tot: 385000000, prio: 10, y27: 385000000, y28: 0, y29: 0, y30: 0, y31: 0, lat: -6.898, lng: 110.642 },
  { no: 12, nama: "Jalan Wedung - Seklenting", kec: "Wedung", pj: 4.178, rr: 0.400, rb: 1.409, tot: 11543900000, prio: 11, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 2000000000, y31: 2000000000, lat: -6.772, lng: 110.582 },
  { no: 13, nama: "Jalan gemulak - sidorejo", kec: "Sayung", pj: 5.892, rr: 0.041, rb: 4.217, tot: 30098550000, prio: 12, y27: 1000000000, y28: 1000000000, y29: 0, y30: 2000000000, y31: 2000000000, lat: -6.932, lng: 110.525 },
  { no: 14, nama: "Jalan Gebang - Gebangarum", kec: "Bonang", pj: 2.087, rr: 0.427, rb: 0, tot: 1643950000, prio: 13, y27: 1000000000, y28: 643950000, y29: 0, y30: 0, y31: 0, lat: -6.835, lng: 110.595 },
  { no: 15, nama: "Jalan Tedunan - Mutih Kulon", kec: "Wedung", pj: 3.931, rr: 0.451, rb: 0.538, tot: 5556150000, prio: 14, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 2000000000, y31: 556150000, lat: -6.788, lng: 110.612 },
  { no: 16, nama: "Jalan Loireng - Pilangsari", kec: "Sayung", pj: 2.731, rr: 0, rb: 1.863, tot: 13227300000, prio: 15, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 1000000000, y31: 2000000000, lat: -6.942, lng: 110.518 },
  { no: 17, nama: "Jalan Wonoagung - Karangsari", kec: "Karangtengah", pj: 6.832, rr: 0.399, rb: 2.794, tot: 21373550000, prio: 16, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 1000000000, y31: 2000000000, lat: -6.918, lng: 110.612 },
  { no: 18, nama: "Jalan Sidogemah - Bedono", kec: "Sayung", pj: 5.882, rr: 0, rb: 3.592, tot: 25503200000, prio: 17, y27: 1000000000, y28: 1000000000, y29: 1000000000, y30: 1000000000, y31: 2000000000, lat: -6.928, lng: 110.495 },
  { no: 19, nama: "Jalan Brambang - Waru", kec: "Karangawen, Mranggen", pj: 8.503, rr: 1.825, rb: 1.106, tot: 14878850000, prio: 18, y27: 730000000, y28: 1000000000, y29: 1000000000, y30: 1000000000, y31: 2000000000, lat: -7.038, lng: 110.540 },
  { no: 20, nama: "Jalan Tlogorejo - Kendaldoyong", kec: "Wonosalam", pj: 3.410, rr: 0.689, rb: 0.100, tot: 3212650000, prio: 19, y27: 500000000, y28: 773400000, y29: 1000000000, y30: 939250000, y31: 0, lat: -6.915, lng: 110.672 },
  { no: 21, nama: "Jalan Mranggen - Kebonbatur", kec: "Mranggen", pj: 4.142, rr: 0.879, rb: 0.070, tot: 3881150000, prio: 20, y27: 500000000, y28: 500000000, y29: 500000000, y30: 783750000, y31: 696550000, lat: -7.020, lng: 110.518 },
  { no: 22, nama: "Jalan Surodadi - Bedono", kec: "Sayung", pj: 6.777, rr: 0.015, rb: 5.849, tot: 41585650000, prio: 21, y27: 5000000000, y28: 10000000000, y29: 10000000000, y30: 10000000000, y31: 6585650000, lat: -6.920, lng: 110.490 },
  { no: 23, nama: "Jalan Pasir - Buko", kec: "Mijen, Wedung", pj: 7.252, rr: 1.100, rb: 3.468, tot: 28857800000, prio: 22, y27: 4000000000, y28: 6000000000, y29: 6000000000, y30: 6000000000, y31: 6857800000, lat: -6.790, lng: 110.665 },
  { no: 24, nama: "Jalan Banjarsari - Tugu", kec: "Sayung", pj: 4.961, rr: 0.231, rb: 3.392, tot: 24972550000, prio: 23, y27: 4000000000, y28: 5000000000, y29: 5000000000, y30: 5000000000, y31: 5972550000, lat: -6.938, lng: 110.535 },
  { no: 25, nama: "Jalan Bedono - Purwosari (Tanah BBWS)", kec: "Sayung", pj: 3.797, rr: 0.697, rb: 2.473, tot: 20241750000, prio: 24, y27: 3500000000, y28: 4500000000, y29: 4500000000, y30: 4500000000, y31: 3241750000, lat: -6.925, lng: 110.478 },
  { no: 26, nama: "Jalan Mlaten - Turirejo", kec: "Mijen", pj: 5.231, rr: 1.172, rb: 1.992, tot: 18655400000, prio: 25, y27: 3000000000, y28: 4000000000, y29: 4000000000, y30: 4000000000, y31: 3655400000, lat: -6.815, lng: 110.695 },
  { no: 27, nama: "Jalan Wonokerto - Sidorejo", kec: "Karangtengah", pj: 4.696, rr: 0, rb: 2.704, tot: 19198400000, prio: 26, y27: 3000000000, y28: 4000000000, y29: 4000000000, y30: 4000000000, y31: 4198400000, lat: -6.920, lng: 110.598 },
  { no: 28, nama: "Jalan Margohayu - Banyumeneng", kec: "Karangawen, Mranggen", pj: 5.052, rr: 0, rb: 2.488, tot: 17664800000, prio: 27, y27: 3000000000, y28: 4000000000, y29: 4000000000, y30: 3500000000, y31: 3164800000, lat: -7.035, lng: 110.535 },
  { no: 29, nama: "Jalan Gemulak - Bedono", kec: "Sayung", pj: 5.232, rr: 0, rb: 2.460, tot: 17466000000, prio: 28, y27: 3000000000, y28: 3500000000, y29: 3500000000, y30: 3500000000, y31: 3966000000, lat: -6.930, lng: 110.508 },
  { no: 30, nama: "Jalan Sriwulan - Bedono", kec: "Sayung", pj: 2.852, rr: 0.006, rb: 2.374, tot: 16878500000, prio: 29, y27: 3000000000, y28: 3500000000, y29: 3500000000, y30: 3500000000, y31: 3378500000, lat: -6.945, lng: 110.485 },
  { no: 31, nama: "Jalan Bandungrejo - Mijen", kec: "Karanganyar, Mijen", pj: 5.000, rr: 0.100, rb: 2.243, tot: 16310300000, prio: 30, y27: 3000000000, y28: 3500000000, y29: 3500000000, y30: 3500000000, y31: 2810300000, lat: -6.835, lng: 110.745 },
  { no: 32, nama: "Jalan Surodadi - Morodemak", kec: "Sayung, Bonang", pj: 8.010, rr: 0.547, rb: 1.704, tot: 14204350000, prio: 31, y27: 2500000000, y28: 3000000000, y29: 3000000000, y30: 3000000000, y31: 2704350000, lat: -6.875, lng: 110.550 },
  { no: 33, nama: "Jalan Sriwulan - Sayung", kec: "Sayung", pj: 4.102, rr: 0.350, rb: 1.764, tot: 13871900000, prio: 32, y27: 2500000000, y28: 3000000000, y29: 3000000000, y30: 3000000000, y31: 2371900000, lat: -6.950, lng: 110.498 },
  { no: 34, nama: "Jalan Surodadi - Kramat", kec: "Karanganyar", pj: 4.411, rr: 0.515, rb: 1.489, tot: 10321150000, prio: 33, y27: 2000000000, y28: 2000000000, y29: 2000000000, y30: 2000000000, y31: 2321150000, lat: -6.875, lng: 110.775 },
  { no: 35, nama: "Jalan Ngelokulon - Bantengmati", kec: "Mijen", pj: 2.208, rr: 0, rb: 1.872, tot: 10483200000, prio: 34, y27: 2000000000, y28: 2000000000, y29: 2000000000, y30: 2000000000, y31: 2483200000, lat: -6.802, lng: 110.702 },
  { no: 36, nama: "Jalan Kedungwaru Kidul - Wonorejo", kec: "Karanganyar", pj: 2.635, rr: 0.235, rb: 1.602, tot: 12278950000, prio: 35, y27: 2000000000, y28: 2500000000, y29: 2500000000, y30: 2500000000, y31: 2778950000, lat: -6.855, lng: 110.785 },
  { no: 37, nama: "Jalan Bandungrejo - Kalitekuk Ngaluran", kec: "Karanganyar", pj: 3.977, rr: 0.286, rb: 1.462, tot: 10380200000, prio: 36, y27: 2000000000, y28: 2000000000, y29: 2000000000, y30: 2000000000, y31: 2380200000, lat: -6.848, lng: 110.760 },
  { no: 38, nama: "Jalan Babat - Tlogosih", kec: "Kebonagung", pj: 2.383, rr: 0.190, rb: 1.533, tot: 11615800000, prio: 37, y27: 2000000000, y28: 2500000000, y29: 2500000000, y30: 2500000000, y31: 2115800000, lat: -7.005, lng: 110.725 },
  { no: 39, nama: "Jalan Poncoharjo - Serangan", kec: "Bonang", pj: 2.901, rr: 0.146, rb: 1.502, tot: 11226300000, prio: 38, y27: 2000000000, y28: 2500000000, y29: 2500000000, y30: 2500000000, y31: 1726300000, lat: -6.828, lng: 110.575 },
  { no: 40, nama: "Jalan Purwosari - Prampelan", kec: "Sayung", pj: 4.637, rr: 0.157, rb: 1.453, tot: 10920750000, prio: 39, y27: 2000000000, y28: 2000000000, y29: 2000000000, y30: 2500000000, y31: 2420750000, lat: -6.938, lng: 110.505 },
  { no: 41, nama: "Jalan Pidodo - Bakalrejo", kec: "Karangtengah, Guntur", pj: 2.065, rr: 0.085, rb: 1.515, tot: 8811250000, prio: 40, y27: 1500000000, y28: 1800000000, y29: 1800000000, y30: 1800000000, y31: 1911250000, lat: -6.940, lng: 110.590 }
];

const binaMargaRoads = rawRoads.map((r, i) => {
  return {
    id: `BM-JLN-${String(i + 1).padStart(3, '0')}`,
    bidang: "Bina Marga",
    sub_bidang: "Jalan",
    nama_pekerjaan: `Peningkatan & Rekonstruksi ${r.nama}`,
    ruas: r.nama,
    kecamatan: r.kec,
    panjang_total_km: r.pj,
    rusak_ringan_km: r.rr,
    rusak_berat_km: r.rb,
    kebutuhan_anggaran: r.tot,
    prioritas: r.prio,
    anggaran_tahun: {
      "2027": r.y27,
      "2028": r.y28,
      "2029": r.y29,
      "2030": r.y30,
      "2031": r.y31
    },
    lat: r.lat,
    lng: r.lng,
    keterangan: `Pekerjaan Jalan Kabupaten pada ruas ${r.nama} melintasi ${r.kec}. Penanganan konstruksi rigid/aspal mantap.`,
    status: "Direncanakan"
  };
});

// 4. BRIDGES (Sample set covering different subdistricts)
const rawBridges = [
  { nama: "Jembatan Mutihkulon (K. Lobang)", ruas: "Jetak - Tedunan", kec: "Wedung", p: 36.6, k: "Rusak Berat", sm: "Tidak Mantap", y27: 850000000, y28: 650000000, lat: -6.785, lng: 110.615 },
  { nama: "Jembatan Pogangan / CF 11", ruas: "Demak - Purworejo", kec: "Bonang", p: 8.7, k: "Rusak Berat", sm: "Tidak Mantap", y27: 450000000, y28: 0, lat: -6.855, lng: 110.590 },
  { nama: "Jembatan Margohayu 3", ruas: "Kangkung - Tlogorejo", kec: "Karangawen", p: 3.0, k: "Kritis", sm: "Tidak Mantap", y27: 550000000, y28: 0, lat: -7.042, lng: 110.555 },
  { nama: "Jembatan Banjarsari 2 / K. Jragung", ruas: "Banjarsari - Tugu", kec: "Sayung", p: 100.0, k: "Kritis", sm: "Tidak Mantap", y27: 1200000000, y28: 1500000000, lat: -6.935, lng: 110.515 },
  { nama: "Jembatan Babalan Wedung", ruas: "Tedunan - Menco", kec: "Wedung", p: 37.5, k: "Kritis", sm: "Tidak Mantap", y27: 950000000, y28: 800000000, lat: -6.790, lng: 110.602 },
  { nama: "Jembatan Karangasem 1 / K. Dombo", ruas: "Bulusari - Kalisari", kec: "Sayung", p: 70.0, k: "Rusak Ringan", sm: "Mantap", y27: 250000000, y28: 0, lat: -6.955, lng: 110.518 },
  { nama: "Jembatan Jragung / K. Jragung", ruas: "Karangawen - Jragung", kec: "Karangawen", p: 78.4, k: "Rusak Ringan", sm: "Mantap", y27: 300000000, y28: 0, lat: -7.065, lng: 110.575 },
  { nama: "Jembatan Bungo / K. Wulan", ruas: "Wedung - Bungo", kec: "Wedung", p: 151.4, k: "Rusak Ringan", sm: "Mantap", y27: 500000000, y28: 0, lat: -6.778, lng: 110.588 },
  { nama: "Jembatan Kali Jajar Singorejo", ruas: "Singorejo - Wedung", kec: "Demak", p: 73.2, k: "Rusak Sedang", sm: "Mantap", y27: 350000000, y28: 0, lat: -6.878, lng: 110.628 },
  { nama: "Jembatan Betengan 1 / K. Jajar", ruas: "Bintoro Demak", kec: "Demak", p: 35.5, k: "Kritis", sm: "Tidak Mantap", y27: 750000000, y28: 500000000, lat: -6.892, lng: 110.635 },
  { nama: "Jembatan Dempet / K. Jajar", ruas: "Dempet - Mintreng", kec: "Dempet", p: 24.4, k: "Rusak Sedang", sm: "Mantap", y27: 400000000, y28: 0, lat: -6.962, lng: 110.722 },
  { nama: "Jembatan C.72 Gajah", ruas: "Gajah - Dempet", kec: "Gajah", p: 45.3, k: "Rusak Sedang", sm: "Mantap", y27: 500000000, y28: 300000000, lat: -6.898, lng: 110.768 },
  { nama: "Jembatan W 2 Karanganyar", ruas: "Mijen - Karanganyar", kec: "Karanganyar", p: 16.0, k: "Rusak Sedang", sm: "Mantap", y27: 350000000, y28: 0, lat: -6.868, lng: 110.792 },
  { nama: "Jembatan Kebonbatur / Bengkung", ruas: "Kebonbatur - Batursari", kec: "Mranggen", p: 35.0, k: "Rusak Ringan", sm: "Mantap", y27: 400000000, y28: 0, lat: -7.028, lng: 110.512 },
  { nama: "Jembatan Guntur (Buyaran - Karangawen)", ruas: "Buyaran - Karangawen", kec: "Guntur", p: 6.0, k: "Baik", sm: "Mantap", y27: 150000000, y28: 0, lat: -6.982, lng: 110.582 },
  { nama: "Jembatan Dukun / K. Jragung", ruas: "Klitih - Dukun", kec: "Karangtengah", p: 72.3, k: "Rusak Sedang", sm: "Mantap", y27: 650000000, y28: 400000000, lat: -6.918, lng: 110.608 },
  { nama: "Jembatan Werdoyo 1 / BSAB.45", ruas: "Mangunrejo - Werdoyo", kec: "Kebonagung", p: 10.0, k: "Rusak Ringan", sm: "Mantap", y27: 250000000, y28: 0, lat: -7.012, lng: 110.742 }
];

const binaMargaBridges = rawBridges.map((b, i) => {
  const total = (b.y27 || 0) + (b.y28 || 0);
  return {
    id: `BM-JBT-${String(i + 1).padStart(3, '0')}`,
    bidang: "Bina Marga",
    sub_bidang: "Jembatan",
    nama_pekerjaan: `Penanganan ${b.nama}`,
    ruas: b.ruas,
    kecamatan: b.kec,
    panjang_m: b.p,
    kondisi: b.k,
    status_mantap: b.sm,
    kebutuhan_anggaran: total,
    prioritas: b.k === "Kritis" ? 1 : (b.k === "Rusak Berat" ? 2 : 3),
    anggaran_tahun: {
      "2027": b.y27 || 0,
      "2028": b.y28 || 0,
      "2029": 0,
      "2030": 0,
      "2031": 0
    },
    lat: b.lat,
    lng: b.lng,
    keterangan: `Penanganan infrastruktur jembatan bentang ${b.p}m kondisi ${b.k} (${b.sm}) pada ruas ${b.ruas}.`,
    status: "Direncanakan"
  };
});

// 5. SDA BK COMPLETE LIST
const rawSdaBk = [
  { no: 1, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Tambakroto Kec. Sayung", y27: 1000000000, y28: 0, y29: 0, y30: 0, sub: "Pompa & Drainase" },
  { no: 2, nama: "Pembangunan Rumah Pompa dan Pengadaan Engine Pump Desa Rejosari Kec. Karangtengah", y27: 1000000000, y28: 0, y29: 0, y30: 0, sub: "Pompa & Drainase" },
  { no: 3, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Karangasem Kec. Sayung", y27: 0, y28: 1000000000, y29: 0, y30: 0, sub: "Pompa & Drainase" },
  { no: 4, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Kelurahan Betokan Kec. Demak", y27: 0, y28: 1000000000, y29: 0, y30: 0, sub: "Pompa & Drainase" },
  { no: 5, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Karangrejo Kec. Bonang", y27: 0, y28: 0, y29: 1000000000, y30: 0, sub: "Pompa & Drainase" },
  { no: 6, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Sidorejo Kec. Sayung", y27: 0, y28: 0, y29: 1000000000, y30: 0, sub: "Pompa & Drainase" },
  { no: 7, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Batu Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 1000000000, sub: "Pompa & Drainase" },
  { no: 8, nama: "Pembangunan Rumah Pompa dan Pengadaan Pompa Desa Banjarsari Kec. Sayung", y27: 0, y28: 0, y29: 0, y30: 1000000000, sub: "Pompa & Drainase" },
  { no: 10, nama: "Rehabilitasi Pintu Air Desa Prampelan Kec. Sayung", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 11, nama: "Rehabilitasi Pintu Air Mapagan Dukuh Wonodadi Lor Desa Wonoagung Kec. Karangtengah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 12, nama: "Rehabilitasi Pintu Air Desa Wringinjajar Kec. Mranggen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 13, nama: "Rehabilitasi Check Dam Desa Prampelan Kec. Sayung", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 14, nama: "Rehabilitasi Check Dam Desa Waru Kec. Mranggen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 15, nama: "Rehabilitasi Pintu Air Kali Serut Kec. Guntur", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 16, nama: "Rehabilitasi Pintu Air Saluran Pembuang Desa Kalicilik Kec. Demak", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 17, nama: "Rehabilitasi Pintu Air Dukuh Pidodo Desa Karangrejo Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 18, nama: "Rehabilitasi Check Dam Desa Tempuran Kec. Demak", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 19, nama: "Rehabilitasi Check Dam Desa Sumengko Kec. Karangtengah", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 20, nama: "Rehabilitasi Pintu Air Sungai B.7 Kec. Karangtengah", y27: 0, y28: 0, y29: 600000000, y30: 0, sub: "Pintu Air" },
  { no: 21, nama: "Rehabilitasi Pintu Air Afvour Tempe Desa Sayung Kec. Sayung", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Pintu Air" },
  { no: 22, nama: "Rehabilitasi Pintu Air Dukuh Mlawung Desa Karangrejo Kec. Bonang", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Pintu Air" },
  { no: 23, nama: "Rehabilitasi Check Dam Desa Gaji Kec. Guntur", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Check Dam" },
  { no: 24, nama: "Rehabilitasi Check Dam Deresan Kec. Karangtengah", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Check Dam" },
  { no: 25, nama: "Rehabilitasi Pintu Air Kali Babadan Kec. Sayung", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Pintu Air" },
  { no: 26, nama: "Rehabilitasi Pintu Air Desa Karangasem Sayung", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Pintu Air" },
  { no: 27, nama: "Rehabilitasi Pintu Air Desa Poncoharjo Kec. Bonang", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Pintu Air" },
  { no: 28, nama: "Rehabilitasi Check Dam Jali Kec. Bonang", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Check Dam" },
  { no: 29, nama: "Rehabilitasi Check Dam Wonoagung Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Check Dam" },
  { no: 30, nama: "Pemeliharaan Check Dam Jali Kec. Bonang", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 31, nama: "Pemeliharaan Check Dam Wonoagung Kec. Karangtengah", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 32, nama: "Pemeliharaan Check Dam Blerong Kec. Guntur", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 33, nama: "Pemeliharaan Check Dam Sumberejo Kec. Mranggen", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 34, nama: "Pemeliharaan Check Dam Desa Prampelan Kec. Sayung", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 35, nama: "Pemeliharaan Check Dam Desa Waru Kec. Mranggen", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 36, nama: "Pemeliharaan Check Dam Rejosari Kec. Karangtengah", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 37, nama: "Pemeliharaan Check Dam Jatirogo Kec. Bonang", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Check Dam" },
  { no: 38, nama: "Pemeliharaan Check Dam Desa Tempuran Kec. Demak", y27: 0, y28: 0, y29: 50000000, y30: 0, sub: "Check Dam" },
  { no: 39, nama: "Pemeliharaan Check Dam Desa Sumengko Kec. Karangtengah", y27: 0, y28: 0, y29: 50000000, y30: 0, sub: "Check Dam" },
  { no: 40, nama: "Pemeliharaan Check Dam Trengguli Kec. Wonosalam", y27: 0, y28: 0, y29: 50000000, y30: 0, sub: "Check Dam" },
  { no: 41, nama: "Pemeliharaan Check Dam Krandon Kec. Guntur", y27: 0, y28: 0, y29: 50000000, y30: 0, sub: "Check Dam" },
  { no: 42, nama: "Pemeliharaan Check Dam Desa Gaji Kec. Guntur", y27: 0, y28: 0, y29: 0, y30: 50000000, sub: "Check Dam" },
  { no: 43, nama: "Pemeliharaan Check Dam Deresan Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 50000000, sub: "Check Dam" },
  { no: 44, nama: "Pemeliharaan Check Dam Jatisono Kec. Gajah", y27: 0, y28: 0, y29: 0, y30: 50000000, sub: "Check Dam" },
  { no: 45, nama: "Pemeliharaan Check Dam Ngelokulon Kec. Mijen", y27: 0, y28: 0, y29: 0, y30: 50000000, sub: "Check Dam" },
  { no: 46, nama: "Pemeliharaan Embung Tlogorejo Kec. Wonosalam", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 47, nama: "Pemeliharaan Embung Kendaldoyong Kec. Wonosalam", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 48, nama: "Pemeliharaan Embung Jogoloyo Kec. Wonosalam", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 49, nama: "Pemeliharaan Embung Mangunjiwan Kec. Demak", y27: 50000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 50, nama: "Pemeliharaan Embung Donorojo Kec. Demak", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 51, nama: "Pemeliharaan Embung Sedo Kec. Demak", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 52, nama: "Pemeliharaan Embung Jatirogo Kec. Bonang", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 53, nama: "Pemeliharaan Embung Temuroso Kec. Guntur", y27: 0, y28: 50000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 62, nama: "Normalisasi Saluran Afvour Desa Sambiroto Kec. Gajah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 63, nama: "Normalisasi Afvour Wonoketingal Kabupaten Demak Kec. Karanganyar", y27: 300000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 64, nama: "Normalisasi Afvour Desa Sari Kec. Gajah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 65, nama: "Normalisasi Afvour Wonorejomati Desa Jatirejo Kec. Karanganyar", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 66, nama: "Normalisasi Afvour Gendong Desa Bunderan - Desa Tlogosih Kec. Wonosalam", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 67, nama: "Normalisasi Afvour Dk. Jogo - Dk. Belah Desa Gemulak Kec. Sayung", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 68, nama: "Normalisasi Sungai Kumpulan Kec. Bonang", y27: 400000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 69, nama: "Normalisasi Afvour D.44 Desa Karangmlati Kec. Demak", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 70, nama: "Normalisasi Afvour Desa Kedungwaru Kidul Kec. Karanganyar", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 71, nama: "Normalisasi Saluran Jamus - Wringinjajar Kec. Mranggen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 72, nama: "Normalisasi Afvour Desa Pecuk Kec. Mijen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 73, nama: "Normalisasi Afvour Utara Kec. Mijen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 74, nama: "Normalisasi Afvour C.23 Kecamatan Wonosalam", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 75, nama: "Normalisasi Sungai B7 Kec. Karangtengah", y27: 2000000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 76, nama: "Normalisasi Afvour Gajah Kanal Kec. Gajah", y27: 3000000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 77, nama: "Normalisasi Saluran Induk Pelayaran Buyaran Kec. Karangtengah", y27: 2000000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 78, nama: "Normalisasi Kali Kenceng Desa Wonorejo Kec. Karanganyar", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 79, nama: "Normalisasi Saluran Pembuang Desa Prampelan - Desa Karangasem Kec. Sayung", y27: 0, y28: 100000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 80, nama: "Normalisasi Saluran Air Desa Rejosari Kec. Karangtengah", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 81, nama: "Normalisasi Afvour Dukuh Daleman Cinde Desa Gemulak Kec. Sayung", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 82, nama: "Normalisasi Afvour Desa Wonoketingal Dukuh Gajah Lor Kec. Karanganyar", y27: 0, y28: 300000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 83, nama: "Normalisasi Saluran Air Desa Bakalrejo - Desa Klitih Kec. Guntur", y27: 0, y28: 400000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 84, nama: "Normalisasi Saluran Air Desa Blerong Kec. Guntur", y27: 0, y28: 300000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 85, nama: "Normalisasi Afvour Tembiring Kec. Demak", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 86, nama: "Normalisasi Afvour Blok Sawah Desa Sidorejo Kec. Sayung", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 87, nama: "Normalisasi Afvour Penghubung C.60 - C.72 Kec. Gajah", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 88, nama: "Normalisasi Saluran Banyon Kel. Kalicilik Kec. Demak", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 89, nama: "Normalisasi Saluran Dukuh Gigil Desa Sukodono Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 90, nama: "Normalisasi Afvour Dukuh Ngasinan Desa Kembangan Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 91, nama: "Normalisasi Sungai Dombo Kec. Sayung", y27: 0, y28: 2000000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 92, nama: "Normalisasi Sungai Lobang Kec. Wedung", y27: 0, y28: 2000000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 93, nama: "Normalisasi Sungai Tuntang Lama Kec. Demak", y27: 0, y28: 2000000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 94, nama: "Normalisasi Saluran Sekunder Mandasari Kec. Mranggen", y27: 0, y28: 0, y29: 300000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 95, nama: "Normalisasi Afvour Sidowayah Kec. Dempet", y27: 0, y28: 0, y29: 300000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 96, nama: "Normalisasi Afvour C.63 Kabupaten Demak Kec. Wonosalam", y27: 0, y28: 0, y29: 300000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 97, nama: "Normalisasi Afvour C.64 Kabupaten Demak Kec. Gajah", y27: 0, y28: 0, y29: 300000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 98, nama: "Normalisasi Saluran Air Bakalrejo Kec. Guntur", y27: 0, y28: 0, y29: 400000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 99, nama: "Normalisasi Sungai Gonjol Kab. Demak Kec. Karangawen", y27: 0, y28: 0, y29: 2000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 100, nama: "Normalisasi Afvour Desa Banjarsari Kec. Sayung", y27: 0, y28: 0, y29: 300000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 103, nama: "Normalisasi Sungai Tulung Kec. Wedung", y27: 0, y28: 0, y29: 5000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 104, nama: "Normalisasi Sedo Kanal Kec. Demak", y27: 0, y28: 0, y29: 5000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 105, nama: "Normalisasi Afvour Desa Donorojo Kec. Demak - Desa Sumberejo Kec. Bonang", y27: 0, y28: 0, y29: 500000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 107, nama: "Normalisasi Sungai Setu Kec. Karangtengah", y27: 0, y28: 0, y29: 2000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 108, nama: "Normalisasi Sungai Teleng Kec. Sayung", y27: 0, y28: 0, y29: 2000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 109, nama: "Normalisasi Sungai Wonokerto Kec. Karangtengah", y27: 0, y28: 0, y29: 2000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 110, nama: "Normalisasi Afvour Babadan Sayung - Loireng Kec. Sayung", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 115, nama: "Normalisasi Afvour Tlogosih Kec. Kebonagung", y27: 0, y28: 0, y29: 0, y30: 300000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 116, nama: "Normalisasi Sekunder Mlilir Kec. Kebonagung", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 117, nama: "Normalisasi Kali Reong Kec. Karangawen", y27: 0, y28: 0, y29: 0, y30: 1000000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 118, nama: "Normalisasi Kali Lanang Kec. Wonosalam", y27: 0, y28: 0, y29: 0, y30: 1000000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 120, nama: "Normalisasi Kali Silarak Desa Betahwalang Kec. Bonang", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 121, nama: "Normalisasi Kali Goleng Desa Betahwalang Kec. Bonang", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 123, nama: "Normalisasi Sungai Onggorawe Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 2000000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 126, nama: "Pembangunan Embung Desa Turirejo Kec. Demak", y27: 500000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 127, nama: "Pembangunan Embung Desa Sidorejo Kec. Karangawen", y27: 0, y28: 500000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 128, nama: "Pembangunan Pintu Air Desa Wonorejo Kec. Karanganyar", y27: 300000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 129, nama: "Pembangunan Pintu Air Desa Batu Kali Deresan Kec. Karangtengah", y27: 500000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 130, nama: "Pembangunan Pintu Air Desa Purwosari Kec. Sayung", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 131, nama: "Pembangunan Pintu Air Dukuh Babadan Desa Sumberejo Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 132, nama: "Pembangunan Pintu Air Desa Wonokerto Kec. Karangtengah", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Pintu Air" },
  { no: 135, nama: "Pembangunan Pintu Air Desa Rejosari Kec. Karangtengah", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Pintu Air" },
  { no: 137, nama: "Pembangunan Pintu Air Desa Kembangan Kec. Bonang", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Pintu Air" },
  { no: 140, nama: "Pembangunan Talud S.46 Jetak Demung Desa Pilangrejo Kec. Wonosalam", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Talud & Tanggul" },
  { no: 142, nama: "Rehabilitasi Afvour Desa Donorejo Kec. Karangtengah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 143, nama: "Rehabilitasi Saluran Air Pojok Dapi Desa Katonsari Kec. Demak", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 144, nama: "Rehabilitasi Saluran Irigasi Kepoh Dk. Karangpacing Desa Rejosari Kec. Karangawen", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 145, nama: "Pembangunan Talud Desa Cangkring B Kec. Karanganyar", y27: 400000000, y28: 0, y29: 0, y30: 0, sub: "Talud & Tanggul" },
  { no: 147, nama: "Rehabilitasi Saluran Tambirejo Kec. Gajah", y27: 500000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 148, nama: "Rehabilitasi Saluran Air Dukuh Karangmalang Desa Mangunan Lor Kec. Kebonagung", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 149, nama: "Rehabilitasi Saluran Desa Karangasem Kec. Sayung", y27: 500000000, y28: 0, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 151, nama: "Rehabilitasi Saluran Air Ds Kuwu Kec. Dempet", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 152, nama: "Rehabilitasi Afvour Desa Kalisari Kec. Sayung", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 153, nama: "Rehabilitasi Afvour Desa Wringinjajar - Kali Wedus Kec. Mranggen", y27: 0, y28: 500000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 154, nama: "Rehabilitasi Afvour Desa Sidorejo Kec. Sayung", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 155, nama: "Rehabilitasi Afvour Desa Jleper Kec. Mijen", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 156, nama: "Rehabilitasi Kali Teleng Kec. Sayung", y27: 0, y28: 2000000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 157, nama: "Rehabilitasi Saluran Dukuh Daleman Desa Sayung", y27: 0, y28: 1000000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 158, nama: "Rehabilitasi Saliran Desa Sriwulan Kec. Sayung", y27: 0, y28: 500000000, y29: 0, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 161, nama: "Rehabilitasi Saluran Desa Boyolali Kec. Gajah", y27: 0, y28: 0, y29: 2000000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 164, nama: "Rehabilitasi Saluran Sekunder Dangi Kec. Kebonagung", y27: 0, y28: 0, y29: 500000000, y30: 0, sub: "Irigasi" },
  { no: 166, nama: "Rehabilitasi Saluran Air Desa Cangkring Rembang Kec. Karanganyar", y27: 0, y28: 0, y29: 500000000, y30: 0, sub: "Normalisasi Sungai/Afvour" },
  { no: 168, nama: "Rehabilitasi Afvour Desa Buko Kec. Wedung", y27: 0, y28: 0, y29: 0, y30: 300000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 171, nama: "Rehabilitasi Afvour Desa Wonosalam Kec. Wonosalam", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 172, nama: "Rehabilitasi Kali Penceng Kec. Sayung", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Normalisasi Sungai/Afvour" },
  { no: 177, nama: "Rehabilitasi Embung Desa Kedungori Kec. Dempet", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 178, nama: "Rehabilitasi Embung Desa Kunir Kec. Dempet", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Embung" },
  { no: 179, nama: "Rehabilitasi Embung Rowosedo Kec. Demak", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 180, nama: "Rehabilitasi Embung Trengguli Kec. Wonosalam", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Embung" },
  { no: 181, nama: "Rehabilitasi Embung Kenduren Kec. Wedung", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Embung" },
  { no: 182, nama: "Rehabilitasi Embung Bungo Kec. Wedung", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Embung" },
  { no: 183, nama: "Rehabilitasi Embung Pasir Kec. Mijen", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Embung" },
  { no: 184, nama: "Embung Kedondong Kec. Demak", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Embung" },
  { no: 185, nama: "Pembangunan Jaringan Irigasi D.I. Gablok Kec. Karangawen", y27: 1000000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 186, nama: "Pembangunan Jaringan Irigasi Tambak Ds. Bedono Kec. Sayung", y27: 500000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 187, nama: "Rehabilitasi Jaringan Irigasi D.I. Polder Batu Kec. Karangtengah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 188, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Tambakbulusan Kec. Karangtengah", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 189, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Gebang Kec. Bonang", y27: 200000000, y28: 0, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 190, nama: "Pembangunan Jaringan Irigasi D.I. Sukabaru Kec. Wedung", y27: 0, y28: 1000000000, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 191, nama: "Pembangunan Jaringan Irigasi Tambak Ds. Mandung Kec. Wedung", y27: 0, y28: 500000000, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 193, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Betahwalang Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 194, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Gebangarum Kec. Bonang", y27: 0, y28: 200000000, y29: 0, y30: 0, sub: "Irigasi" },
  { no: 195, nama: "Pembangunan Jaringan Irigasi D.I. Polder Batu Kec. Karangtengah", y27: 0, y28: 0, y29: 1000000000, y30: 0, sub: "Irigasi" },
  { no: 196, nama: "Pembangunan Jaringan Irigasi Tambak Ds. Timbulsloko Kec. Sayung", y27: 0, y28: 0, y29: 500000000, y30: 0, sub: "Irigasi" },
  { no: 197, nama: "Rehabilitasi Jaringan Irigasi D.I. Pelayaran Buyaran Kec. Karangtengah", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Irigasi" },
  { no: 198, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Purworejo Kec. Bonang", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Irigasi" },
  { no: 199, nama: "Rehabilitasi Jaringan Irigasi Tambak Tedunan Kec. Wedung", y27: 0, y28: 0, y29: 200000000, y30: 0, sub: "Irigasi" },
  { no: 200, nama: "Pembangunan Jaringan Irigasi D.I. Pelayaran Buyaran Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 1000000000, sub: "Irigasi" },
  { no: 201, nama: "Pembangunan Jaringan Irigasi Tambak Ds. Wedung Kec. Wedung", y27: 0, y28: 0, y29: 0, y30: 500000000, sub: "Irigasi" },
  { no: 202, nama: "Rehabilitasi Jaringan Irigasi D.I. Sumberejo Kec. Mranggen", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Irigasi" },
  { no: 203, nama: "Rehabilitasi Jaringan Irigasi Tambak Ds. Wonoagung Kec. Karangtengah", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Irigasi" },
  { no: 204, nama: "Rehabilitasi Jaringan Irigasi Tambak Buko Kec. Wedung", y27: 0, y28: 0, y29: 0, y30: 200000000, sub: "Irigasi" }
];

const sdaBkProjects = rawSdaBk.map((item, idx) => {
  const kec = detectKecamatan(item.nama);
  const targetKec = kecamatanList.find(k => k.nama.toLowerCase() === kec.toLowerCase()) || kecamatanList[0];
  const jitterLat = ((idx * 17) % 30 - 15) * 0.0012;
  const jitterLng = ((idx * 23) % 30 - 15) * 0.0012;
  const totalAnggaran = (item.y27 || 0) + (item.y28 || 0) + (item.y29 || 0) + (item.y30 || 0);

  return {
    id: `SDA-PRJ-${String(idx + 1).padStart(3, '0')}`,
    bidang: "SDA BK",
    sub_bidang: item.sub || "Sumber Daya Air",
    nama_pekerjaan: item.nama,
    ruas: "-",
    kecamatan: kec,
    panjang_total_km: item.sub === "Normalisasi Sungai/Afvour" ? 2.5 : 0,
    panjang_m: 0,
    kebutuhan_anggaran: totalAnggaran,
    prioritas: (idx % 3) + 1,
    anggaran_tahun: {
      "2027": item.y27 || 0,
      "2028": item.y28 || 0,
      "2029": item.y29 || 0,
      "2030": item.y30 || 0,
      "2031": 0
    },
    lat: Number((targetKec.lat + jitterLat).toFixed(5)),
    lng: Number((targetKec.lng + jitterLng).toFixed(5)),
    keterangan: `Pekerjaan ${item.sub} di wilayah Kecamatan ${kec}, Kabupaten Demak.`,
    status: "Direncanakan"
  };
});

// 6. CIPTA KARYA & TATA RUANG (TRP)
const ciptaKaryaProjects = [
  {
    id: "CK-PRJ-001",
    bidang: "Cipta Karya",
    sub_bidang: "Air Minum & Sanitasi",
    nama_pekerjaan: "Pembangunan SPAM Jaringan Distribusi Utama (JDU) Kawasan Sayung",
    ruas: "Kawasan Industri & Pesisir Sayung",
    kecamatan: "Sayung",
    panjang_total_km: 12.5,
    kebutuhan_anggaran: 8500000000,
    prioritas: 1,
    anggaran_tahun: { "2027": 3000000000, "2028": 3000000000, "2029": 2500000000, "2030": 0, "2031": 0 },
    lat: -6.935,
    lng: 110.512,
    keterangan: "Penyediaan air minum bersih untuk penanggulangan dampak intrusi air laut dan rob pesisir Sayung.",
    status: "Direncanakan"
  },
  {
    id: "CK-PRJ-002",
    bidang: "Cipta Karya",
    sub_bidang: "Penataan Bangunan Gedung",
    nama_pekerjaan: "Revitalisasi & Penataan Kawasan Alun-Alun dan Masjid Agung Demak",
    ruas: "Kawasan Alun-Alun Demak",
    kecamatan: "Demak",
    panjang_total_km: 0,
    kebutuhan_anggaran: 15000000000,
    prioritas: 1,
    anggaran_tahun: { "2027": 5000000000, "2028": 5000000000, "2029": 5000000000, "2030": 0, "2031": 0 },
    lat: -6.894,
    lng: 110.637,
    keterangan: "Penataan lanskap pusaka cagar budaya religi dan fasilitas publik penunjang pariwisata Demak Kota Wali.",
    status: "Direncanakan"
  },
  {
    id: "CK-PRJ-003",
    bidang: "Cipta Karya",
    sub_bidang: "Sanitasi & Pengolahan Limbah",
    nama_pekerjaan: "Pembangunan Instalasi Pengolahan Lumpur Tinja (IPLT) Kalikondang",
    ruas: "Kelurahan Kalikondang",
    kecamatan: "Demak",
    panjang_total_km: 0,
    kebutuhan_anggaran: 4200000000,
    prioritas: 2,
    anggaran_tahun: { "2027": 1200000000, "2028": 1500000000, "2029": 1500000000, "2030": 0, "2031": 0 },
    lat: -6.888,
    lng: 110.652,
    keterangan: "Optimalisasi sanitasi lingkungan perkotaan dan pengelolaan air limbah domestik terpadu.",
    status: "Direncanakan"
  },
  {
    id: "CK-PRJ-004",
    bidang: "Cipta Karya",
    sub_bidang: "Drainase Lingkungan",
    nama_pekerjaan: "Pembangunan Drainase Lingkungan Permukiman Padat Mranggen",
    ruas: "Kawasan Batursari - Kebonbatur",
    kecamatan: "Mranggen",
    panjang_total_km: 4.8,
    kebutuhan_anggaran: 3800000000,
    prioritas: 2,
    anggaran_tahun: { "2027": 1800000000, "2028": 2000000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -7.022,
    lng: 110.518,
    keterangan: "Pengendalian genangan air hujan di permukiman perkotaan Mranggen.",
    status: "Direncanakan"
  },
  {
    id: "CK-PRJ-005",
    bidang: "Cipta Karya",
    sub_bidang: "Gedung Kantor",
    nama_pekerjaan: "Rehabilitasi Gedung Pelayanan Publik Kecamatan Bonang",
    ruas: "Kompleks Kantor Kecamatan Bonang",
    kecamatan: "Bonang",
    panjang_total_km: 0,
    kebutuhan_anggaran: 2500000000,
    prioritas: 2,
    anggaran_tahun: { "2027": 1000000000, "2028": 1500000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -6.842,
    lng: 110.588,
    keterangan: "Modernisasi gedung layanan terpadu satu pintu tingkat kecamatan.",
    status: "Direncanakan"
  }
];

const tataRuangProjects = [
  {
    id: "TRP-PRJ-001",
    bidang: "Tata Ruang",
    sub_bidang: "Rencana Detail Tata Ruang (RDTR)",
    nama_pekerjaan: "Penyusunan RDTR Kawasan Industri dan Pesisir Terpadu Sayung - Karangtengah",
    ruas: "Koridor Pantura Sayung - Karangtengah",
    kecamatan: "Sayung",
    panjang_total_km: 0,
    kebutuhan_anggaran: 1200000000,
    prioritas: 1,
    anggaran_tahun: { "2027": 600000000, "2028": 600000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -6.936,
    lng: 110.518,
    keterangan: "Penyusunan peta zonasi dan peraturan pemanfaatan ruang terpadu terintegrasi OSS.",
    status: "Direncanakan"
  },
  {
    id: "TRP-PRJ-002",
    bidang: "Tata Ruang",
    sub_bidang: "Rencana Tata Bangunan dan Lingkungan (RTBL)",
    nama_pekerjaan: "Penyusunan RTBL Koridor Bersejarah Pecinan & Kauman Bintoro Demak",
    ruas: "Kawasan Bintoro Pusat Kota",
    kecamatan: "Demak",
    panjang_total_km: 0,
    kebutuhan_anggaran: 800000000,
    prioritas: 2,
    anggaran_tahun: { "2027": 400000000, "2028": 400000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -6.892,
    lng: 110.638,
    keterangan: "Pedoman tata bangunan arsitektur lokal dan pelestarian visual kawasan pusaka.",
    status: "Direncanakan"
  },
  {
    id: "TRP-PRJ-003",
    bidang: "Tata Ruang",
    sub_bidang: "Pengendalian & Pengawasan Ruang",
    nama_pekerjaan: "Pemetaan Digital Lahan Pertanian Pangan Berkelanjutan (LP2B) Dempet & Gajah",
    ruas: "Kawasan Pertanian Dempet - Gajah",
    kecamatan: "Dempet",
    panjang_total_km: 0,
    kebutuhan_anggaran: 950000000,
    prioritas: 1,
    anggaran_tahun: { "2027": 500000000, "2028": 450000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -6.955,
    lng: 110.725,
    keterangan: "Perlindungan ketahanan pangan berkelanjutan dan validasi spasial satelit.",
    status: "Direncanakan"
  },
  {
    id: "TRP-PRJ-004",
    bidang: "Tata Ruang",
    sub_bidang: "Informasi Geospasial",
    nama_pekerjaan: "Pengembangan Geodatabase Jaringan Utilitas Bawah Tanah Perkotaan Demak",
    ruas: "Kawasan Perkotaan Demak",
    kecamatan: "Demak",
    panjang_total_km: 0,
    kebutuhan_anggaran: 650000000,
    prioritas: 2,
    anggaran_tahun: { "2027": 350000000, "2028": 300000000, "2029": 0, "2030": 0, "2031": 0 },
    lat: -6.895,
    lng: 110.640,
    keterangan: "Penyusunan layer GIS pipa air, kabel bawah tanah, dan drainase primer.",
    status: "Direncanakan"
  }
];

const allPekerjaan = [
  ...binaMargaRoads,
  ...binaMargaBridges,
  ...sdaBkProjects,
  ...ciptaKaryaProjects,
  ...tataRuangProjects
];

const defaultCmsTexts = {
  site_title: "SIREN",
  site_full_name: "Sistem Perencanaan Terintegrasi",
  site_tagline: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak",
  site_badge: "Terpadu, Akuntabel & Berkelanjutan",
  
  hero_title: "Sistem Perencanaan Pembangunan Terintegrasi",
  hero_subtitle: "Peta Interaktif Sebaran Pekerjaan Bidang Bina Marga, SDA BK, Cipta Karya, dan Tata Ruang Kabupaten Demak",
  hero_welcome: "Selamat Datang di SIREN DINPUTARU Kabupaten Demak",
  hero_description: "SIREN menyajikan visualisasi spasial berbasis peta interaktif dan matriks perencanaan pekerjaan fisik infrastruktur secara transparan dari tahun anggaran 2027 hingga 2031 di 14 kecamatan se-Kabupaten Demak.",
  
  map_title: "Peta Interaktif Perencanaan Wilayah Demak",
  map_subtitle: "Klik pada batas kecamatan di peta untuk memfokuskan wilayah dan menampilkan pin titik pekerjaan. Klik tahun (misal 2027) untuk melihat daftar pekerjaan tahun berjalan.",
  map_hint: "Warna Pin: Biru (Bina Marga Jalan & Jembatan), Hijau/Cyan (SDA BK Air & Bangunan Air), Ungu (Cipta Karya), Kuning Emas (Tata Ruang TRP).",
  
  table_title: "Daftar Rincian Pekerjaan Terencana",
  table_subtitle: "Data pekerjaan di bawah ini sinkron otomatis dengan filter kecamatan dan tahun yang dipilih pada peta interaktif.",
  
  login_title: "Masuk Dashboard Internal",
  login_subtitle: "Akses Terproteksi Khusus Pejabat Struktural, Koordinator Bidang, dan Superadmin DINPUTARU Demak",
  login_instruction: "Silakan masukkan username dan password terdaftar, serta jawab verifikasi perhitungan angka (CAPTCHA) di bawah ini.",
  
  dashboard_title: "Dashboard Internal & Infografis Perencanaan",
  dashboard_subtitle: "Monitoring Sebaran Alokasi Anggaran, Prioritas Pekerjaan, dan Analisis Multi-Tahun",
  
  footer_address: "Jl. Kyai Jebat No. 35, Bintoro, Kec. Demak, Kabupaten Demak, Jawa Tengah 59511",
  footer_phone: "(0291) 685112 / 685114",
  footer_email: "dinputaru@demakkab.go.id",
  footer_hours: "Senin - Kamis: 07.15 - 15.30 WIB | Jumat: 07.15 - 11.30 WIB",
  footer_copyright: "© 2026 Pemerintah Kabupaten Demak - Dinas Pekerjaan Umum dan Penataan Ruang. Hak Cipta Dilindungi.",
  
  bidang_bm_desc: "Menangani penyelenggaraan jaringan jalan kabupaten, pemeliharaan berkala, rekonstruksi rigid beton/aspal, dan jembatan.",
  bidang_sda_desc: "Mengelola sumber daya air, rumah pompa banjir rob, normalisasi afvour/sungai, embung penampung, pintu air, dan jaringan irigasi.",
  bidang_ck_desc: "Melaksanakan pembangunan sarana gedung negara, penyediaan air minum perpipaan (SPAM), dan sanitasi permukiman.",
  bidang_trp_desc: "Mengawal rencana detail tata ruang (RDTR), rencana tata bangunan dan lingkungan (RTBL), serta tertib pemanfaatan ruang."
};

fs.writeFileSync(path.join(DATA_DIR, 'kecamatan.json'), JSON.stringify(kecamatanList, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(hashedUsers, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'pekerjaan.json'), JSON.stringify(allPekerjaan, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'cms_texts.json'), JSON.stringify(defaultCmsTexts, null, 2), 'utf8');

console.log("=== SEEDING BERHASIL ===");
console.log(`Kecamatan: ${kecamatanList.length}`);
console.log(`Pengguna: ${hashedUsers.length}`);
console.log(`Total Pekerjaan: ${allPekerjaan.length} (BM Jalan: ${binaMargaRoads.length}, BM Jembatan: ${binaMargaBridges.length}, SDA BK: ${sdaBkProjects.length}, CK: ${ciptaKaryaProjects.length}, TRP: ${tataRuangProjects.length})`);
