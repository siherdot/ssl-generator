/**
 * Konfigurasi CRUD dashboard admin.
 * Satu objek = satu jenis konten yang tampil di situs.
 * Menambah konten baru cukup menambah entri di sini.
 */

export type TipeField =
  | "text"
  | "textarea"
  | "html"
  | "number"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "image";

export type Field = {
  nama: string;
  label: string;
  tipe: TipeField;
  wajib?: boolean;
  bantuan?: string;
  pilihan?: { nilai: string; label: string }[];
  pilihanDari?: "poli" | "dokter";
  lebar?: "penuh" | "setengah";
  bawaan?: string | number;
  maks?: number;
  langkah?: number;
};

export type Resource = {
  kunci: string; // segmen URL: /admin/konten/<kunci>
  label: string;
  labelSatu: string;
  tabel: string;
  pk: string;
  /** generator id untuk tabel lama yang primary key-nya varchar */
  idOtomatis?: { prefix: string; panjang?: number };
  /** kalau hanya satu baris (mis. profil RS) */
  tunggal?: string;
  urut: string;
  kolomDaftar: { nama: string; label: string; tipe?: "gambar" | "tanggal" | "aktif" }[];
  cari: string[];
  fields: Field[];
  /** jenis konten yang bisa ditarik dari SIMRS lewat tombol di dashboard */
  sinkron?: "jadwal" | "kasur";
  keterangan?: string;
  grup: "konten" | "pengaturan" | "pesan";
};

export const resources: Resource[] = [
  {
    kunci: "berita",
    label: "Berita & Kegiatan",
    labelSatu: "Berita",
    tabel: "news",
    pk: "news_id",
    idOtomatis: { prefix: "NEWS-", panjang: 2 },
    urut: "create_date DESC, news_id DESC",
    grup: "konten",
    kolomDaftar: [
      { nama: "news_images", label: "Gambar", tipe: "gambar" },
      { nama: "title", label: "Judul" },
      { nama: "create_date", label: "Tanggal", tipe: "tanggal" },
    ],
    cari: ["title", "content"],
    fields: [
      { nama: "title", label: "Judul berita", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "create_date", label: "Tanggal terbit", tipe: "date", bantuan: "Boleh dikosongkan bila belum ingin menampilkan tanggal." },
      { nama: "news_images", label: "Gambar utama", tipe: "image" },
      { nama: "title_en", label: "Judul (English)", tipe: "text", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "content_en", label: "Isi berita (English)", tipe: "html", lebar: "penuh", bantuan: "Versi Inggris, opsional. Boleh memakai HTML sederhana." },
      { nama: "content", label: "Isi berita", tipe: "html", lebar: "penuh", bantuan: "Boleh memakai HTML sederhana (<p>, <strong>, <ul>, <li>)." },
    ],
  },
  {
    kunci: "dokter",
    label: "Dokter",
    labelSatu: "Dokter",
    tabel: "dokter",
    pk: "id_dokter",
    idOtomatis: { prefix: "DR", panjang: 2 },
    urut: "nama_dokter",
    grup: "konten",
    sinkron: "jadwal",
    kolomDaftar: [
      { nama: "images", label: "Foto", tipe: "gambar" },
      { nama: "nama_dokter", label: "Nama" },
      { nama: "id_poli", label: "Poliklinik" },
    ],
    cari: ["nama_dokter", "ket"],
    fields: [
      { nama: "nama_dokter", label: "Nama lengkap & gelar", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "id_poli", label: "Poliklinik", tipe: "select", pilihanDari: "poli", wajib: true },
      { nama: "images", label: "Foto dokter", tipe: "image" },
      { nama: "ket", label: "Keterangan / profil singkat", tipe: "textarea", lebar: "penuh" },
    ],
  },
  {
    kunci: "jadwal",
    label: "Jadwal Praktik",
    labelSatu: "Jadwal",
    tabel: "jadwal_dokter",
    pk: "id_jadwal",
    idOtomatis: { prefix: "JD", panjang: 2 },
    urut: "id_jadwal DESC",
    grup: "konten",
    sinkron: "jadwal",
    keterangan:
      "Baris yang berasal dari SIMRS hanya berubah lewat tombol “Sinkron dari SIMRS” di halaman ini (tidak ada sinkron otomatis). Mengubah atau menghapus baris SIMRS secara manual akan tertimpa saat sinkron berikutnya.",
    kolomDaftar: [
      { nama: "id_dokter", label: "Dokter" },
      { nama: "hari", label: "Hari" },
      { nama: "jammulai", label: "Mulai" },
      { nama: "jamselesai", label: "Selesai" },
    ],
    cari: ["hari"],
    fields: [
      { nama: "id_dokter", label: "Dokter", tipe: "select", pilihanDari: "dokter", wajib: true },
      { nama: "id_poli", label: "Poliklinik", tipe: "select", pilihanDari: "poli", wajib: true },
      { nama: "hari", label: "Hari", tipe: "text", wajib: true, bantuan: "Boleh beberapa hari dipisah koma, contoh: Senin, Rabu" },
      { nama: "jammulai", label: "Jam mulai", tipe: "time", wajib: true },
      { nama: "jamselesai", label: "Jam selesai", tipe: "time", wajib: true },
    ],
  },
  {
    kunci: "poliklinik",
    label: "Poliklinik",
    labelSatu: "Poliklinik",
    tabel: "poli",
    pk: "id_poli",
    idOtomatis: { prefix: "P", panjang: 2 },
    urut: "nama_poli",
    grup: "konten",
    sinkron: "jadwal",
    kolomDaftar: [
      { nama: "images", label: "Gambar", tipe: "gambar" },
      { nama: "nama_poli", label: "Nama" },
    ],
    cari: ["nama_poli", "ket"],
    fields: [
      { nama: "nama_poli", label: "Nama poliklinik", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "images", label: "Gambar", tipe: "image" },
      { nama: "ket", label: "Keterangan", tipe: "textarea", lebar: "penuh" },
      { nama: "nama_poli_en", label: "Nama poliklinik (English)", tipe: "text", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "ket_en", label: "Keterangan (English)", tipe: "textarea", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
    ],
  },
  {
    kunci: "fasilitas",
    label: "Fasilitas",
    labelSatu: "Fasilitas",
    tabel: "facility",
    pk: "id_facility",
    idOtomatis: { prefix: "facility-", panjang: 0 },
    urut: "facility_name",
    grup: "konten",
    kolomDaftar: [
      { nama: "facility_image", label: "Gambar", tipe: "gambar" },
      { nama: "facility_name", label: "Nama fasilitas" },
    ],
    cari: ["facility_name", "facility_description"],
    fields: [
      { nama: "facility_name", label: "Nama fasilitas", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "facility_image", label: "Gambar", tipe: "image" },
      { nama: "facility_description", label: "Keterangan", tipe: "textarea", lebar: "penuh" },
      { nama: "facility_name_en", label: "Nama fasilitas (English)", tipe: "text", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "facility_description_en", label: "Keterangan (English)", tipe: "textarea", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
    ],
  },
  {
    kunci: "promo",
    label: "Promo",
    labelSatu: "Promo",
    tabel: "promo",
    pk: "id",
    urut: "id DESC",
    grup: "konten",
    kolomDaftar: [
      { nama: "gambar", label: "Gambar", tipe: "gambar" },
      { nama: "judul", label: "Judul" },
      { nama: "selesai", label: "Berakhir", tipe: "tanggal" },
      { nama: "aktif", label: "Aktif", tipe: "aktif" },
    ],
    cari: ["judul", "deskripsi"],
    fields: [
      { nama: "judul", label: "Judul promo", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "gambar", label: "Gambar", tipe: "image" },
      { nama: "link", label: "Tautan", tipe: "text", bantuan: "Opsional." },
      { nama: "mulai", label: "Mulai", tipe: "date" },
      { nama: "selesai", label: "Berakhir", tipe: "date", bantuan: "Kosongkan bila tanpa batas waktu." },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1, lebar: "penuh" },
      { nama: "deskripsi", label: "Deskripsi", tipe: "textarea", lebar: "penuh" },
    ],
  },
  {
    kunci: "testimoni",
    label: "Testimoni",
    labelSatu: "Testimoni",
    tabel: "testimoni",
    pk: "id",
    urut: "id DESC",
    grup: "konten",
    kolomDaftar: [
      { nama: "nama", label: "Nama" },
      { nama: "isi", label: "Isi" },
      { nama: "tampil", label: "Tampil", tipe: "aktif" },
    ],
    cari: ["nama", "isi"],
    fields: [
      { nama: "nama", label: "Nama pasien", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "tanggal", label: "Tanggal", tipe: "date" },
      { nama: "rating", label: "Rating (1–5)", tipe: "number", bawaan: 5, maks: 5, langkah: 1 },
      { nama: "foto", label: "Foto", tipe: "image" },
      { nama: "tampil", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
      { nama: "isi", label: "Isi testimoni", tipe: "textarea", wajib: true, lebar: "penuh" },
    ],
  },
  {
    kunci: "karier",
    label: "Lowongan Karier",
    labelSatu: "Lowongan",
    tabel: "karier",
    pk: "id",
    urut: "id DESC",
    grup: "konten",
    kolomDaftar: [
      { nama: "posisi", label: "Posisi" },
      { nama: "jenis", label: "Jenis" },
      { nama: "ditutup", label: "Ditutup", tipe: "tanggal" },
      { nama: "aktif", label: "Aktif", tipe: "aktif" },
    ],
    cari: ["posisi", "unit", "deskripsi"],
    fields: [
      { nama: "posisi", label: "Posisi", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "unit", label: "Unit / bagian", tipe: "text" },
      {
        nama: "jenis",
        label: "Jenis",
        tipe: "select",
        bawaan: "Full time",
        pilihan: [
          { nilai: "Full time", label: "Full time" },
          { nilai: "Part time", label: "Part time" },
          { nilai: "Kontrak", label: "Kontrak" },
          { nilai: "Magang", label: "Magang" },
        ],
      },
      { nama: "dibuat", label: "Tanggal dibuka", tipe: "date" },
      { nama: "ditutup", label: "Tanggal ditutup", tipe: "date", bantuan: "Kosongkan bila masih dibuka." },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
      { nama: "deskripsi", label: "Deskripsi pekerjaan", tipe: "html", lebar: "penuh" },
      { nama: "kualifikasi", label: "Kualifikasi", tipe: "html", lebar: "penuh" },
    ],
  },
  {
    kunci: "penjamin",
    label: "Asuransi & Penjamin",
    labelSatu: "Penjamin",
    tabel: "penjamin",
    pk: "id",
    urut: "urutan, nama",
    grup: "konten",
    kolomDaftar: [
      { nama: "nama", label: "Nama" },
      { nama: "kategori", label: "Kategori" },
      { nama: "aktif", label: "Aktif", tipe: "aktif" },
    ],
    cari: ["nama", "kategori"],
    fields: [
      { nama: "nama", label: "Nama penjamin", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "logo", label: "Logo asuransi (opsional)", tipe: "image", lebar: "penuh" },
      {
        nama: "kategori",
        label: "Kategori",
        tipe: "select",
        bawaan: "Asuransi",
        pilihan: [
          { nilai: "Asuransi", label: "Asuransi" },
          { nilai: "TPA", label: "TPA" },
          { nilai: "Korporat", label: "Korporat" },
          { nilai: "Multifinance", label: "Multifinance" },
          { nilai: "BUMN", label: "BUMN" },
        ],
      },
      { nama: "urutan", label: "Urutan tampil", tipe: "number", bawaan: 99 },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
    ],
  },
  {
    kunci: "grup-rs",
    label: "Rumah Sakit Grup",
    labelSatu: "Rumah sakit",
    tabel: "grup_rs",
    pk: "id",
    urut: "urutan, nama",
    grup: "konten",
    keterangan:
      "Daftar rumah sakit di halaman publik /rumah-sakit-kami. Isi alamat situs dengan https://… ; isi \"/\" hanya untuk rumah sakit ini sendiri. Kosongkan alamat bila situsnya belum ada.",
    kolomDaftar: [
      { nama: "nama", label: "Nama" },
      { nama: "kota", label: "Kota" },
      { nama: "url", label: "Alamat situs" },
      { nama: "aktif", label: "Aktif", tipe: "aktif" },
    ],
    cari: ["nama", "kota", "url"],
    fields: [
      { nama: "nama", label: "Nama rumah sakit", tipe: "text", wajib: true, lebar: "penuh" },
      { nama: "kota", label: "Kota / provinsi", tipe: "text", lebar: "penuh" },
      { nama: "foto", label: "Foto rumah sakit", tipe: "image", lebar: "penuh" },
      {
        nama: "url",
        label: "Alamat situs (https://… atau / untuk situs ini)",
        tipe: "text",
        lebar: "penuh",
      },
      { nama: "urutan", label: "Urutan tampil", tipe: "number", bawaan: 99 },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
    ],
  },
  {
    kunci: "ketersediaan-kamar",
    label: "Unit Rawat Inap",
    labelSatu: "Unit rawat inap",
    tabel: "kasur",
    pk: "id",
    urut: "urutan, nama_unit",
    grup: "konten",
    sinkron: "kasur",
    keterangan:
      "Angka agregat per unit (bukan data pasien). Tersinkron otomatis dari SIMRS setiap jam; tombol “Sinkron dari SIMRS” untuk menarik sekarang juga.",
    kolomDaftar: [
      { nama: "nama_unit", label: "Unit" },
      { nama: "kelas", label: "Kelas" },
      { nama: "total", label: "Total" },
      { nama: "terisi", label: "Terisi" },
      { nama: "aktif", label: "Aktif", tipe: "aktif" },
    ],
    cari: ["nama_unit", "kelas", "keterangan"],
    fields: [
      { nama: "nama_unit", label: "Nama unit / ruang", tipe: "text", wajib: true, lebar: "penuh" },
      {
        nama: "kelas",
        label: "Kelas",
        tipe: "select",
        bawaan: "III",
        pilihan: [
          { nilai: "VIP", label: "VIP" },
          { nilai: "I", label: "Kelas I" },
          { nilai: "II", label: "Kelas II" },
          { nilai: "III", label: "Kelas III" },
          { nilai: "ICU", label: "ICU" },
          { nilai: "NICU", label: "NICU" },
          { nilai: "HCU", label: "HCU" },
          { nilai: "Isolasi", label: "Ruang isolasi" },
          { nilai: "Bayi", label: "Bayi" },
          { nilai: "Lainnya", label: "Lainnya" },
        ],
      },
      { nama: "total", label: "Jumlah tempat tidur", tipe: "number", wajib: true, bawaan: 0 },
      { nama: "terisi", label: "Terisi", tipe: "number", wajib: true, bawaan: 0 },
      { nama: "keterangan", label: "Keterangan singkat", tipe: "text", bantuan: "Contoh: lantai 3, ruang Melati." },
      { nama: "urutan", label: "Urutan tampil", tipe: "number", bawaan: 99 },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
    ],
  },
  {
    kunci: "simrs",
    label: "Koneksi SIMRS",
    labelSatu: "Koneksi SIMRS",
    tabel: "pengaturan_simrs",
    pk: "id",
    tunggal: "1",
    urut: "id",
    grup: "pengaturan",
    keterangan:
      "Dipakai tombol “Sinkron dari SIMRS” dan sinkron tempat tidur otomatis tiap jam. Kosongkan hanya bila ingin kembali memakai isi environment.",
    kolomDaftar: [{ nama: "api_url", label: "URL API" }],
    cari: ["api_url"],
    fields: [
      {
        nama: "api_url",
        label: "URL API SIMRS",
        tipe: "text",
        wajib: true,
        lebar: "penuh",
        bantuan: "Contoh: https://192.168.10.253:81/api/external/v1 — tanpa garis miring di akhir.",
      },
      {
        nama: "api_key",
        label: "API Key SIMRS",
        tipe: "text",
        wajib: true,
        lebar: "penuh",
        bantuan: "Dikirim sebagai header X-API-Key ke API Eksternal SIMRS.",
      },
    ],
  },
  {
    kunci: "slide",
    label: "Slide Latar Beranda",
    labelSatu: "Slide",
    tabel: "slide_images",
    pk: "id_slide",
    idOtomatis: { prefix: "SL", panjang: 2 },
    urut: "id_slide",
    grup: "konten",
    keterangan:
      "Foto yang diputar otomatis sebagai latar bagian atas beranda (hero). Foto strip sempit sebaiknya dimatikan lewat centang “Tampilkan di situs”.",
    kolomDaftar: [
      { nama: "images", label: "Foto", tipe: "gambar" },
      { nama: "aktif", label: "Tampil", tipe: "aktif" },
    ],
    cari: ["images"],
    fields: [
      { nama: "images", label: "Foto", tipe: "image", wajib: true, lebar: "penuh", bantuan: "Disarankan foto lanskap (minimal 1600px lebar)." },
      { nama: "aktif", label: "Tampilkan di situs", tipe: "checkbox", bawaan: 1 },
    ],
  },
  {
    kunci: "profil",
    label: "Profil Rumah Sakit",
    labelSatu: "Profil",
    tabel: "company",
    pk: "company_id",
    tunggal: "company-1",
    urut: "company_id",
    grup: "pengaturan",
    keterangan: "Data ini dipakai di beranda, halaman tentang, dan footer.",
    kolomDaftar: [{ nama: "hospital_name", label: "Nama" }],
    cari: ["hospital_name"],
    fields: [
      { nama: "hospital_name", label: "Nama rumah sakit", tipe: "text", wajib: true, lebar: "penuh" },
      {
        nama: "logo_hospital",
        label: "Logo rumah sakit",
        tipe: "image",
        bantuan: "Dipakai di kepala halaman (navbar) dan data Google. Sebaiknya PNG latar transparan, minimal 400×400 px.",
      },
      {
        nama: "favicon_hospital",
        label: "Ikon tab browser (favicon)",
        tipe: "image",
        bantuan: "Ikon kecil di tab browser. Sebaiknya PNG persegi 64×64 atau 256×256 px.",
      },
      { nama: "company_name", label: "Nama badan", tipe: "text" },
      { nama: "company_description_en", label: "Tentang rumah sakit (English)", tipe: "textarea", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "visi_en", label: "Visi (English)", tipe: "html", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "misi_en", label: "Misi (English)", tipe: "html", lebar: "penuh", bantuan: "Versi bahasa Inggris (opsional). Kosongkan bila belum ada — situs menampilkan versi Indonesia saat mode EN." },
      { nama: "slogan", label: "Slogan", tipe: "text", lebar: "penuh" },
      { nama: "phone", label: "Telepon", tipe: "text" },
      { nama: "igd_phone", label: "Telepon IGD", tipe: "text" },
      { nama: "fax", label: "Fax", tipe: "text" },
      { nama: "email", label: "Email", tipe: "text" },
      { nama: "alamat", label: "Alamat", tipe: "textarea", lebar: "penuh" },
      { nama: "link_youtube_profile", label: "Tautan video profil", tipe: "text", lebar: "penuh" },
      { nama: "company_description", label: "Deskripsi / sejarah", tipe: "textarea", lebar: "penuh" },
      { nama: "visi", label: "Visi", tipe: "html", lebar: "penuh" },
      { nama: "misi", label: "Misi", tipe: "html", lebar: "penuh" },
    ],
  },
];

export function cariResource(kunci: string): Resource | undefined {
  return resources.find((r) => r.kunci === kunci);
}

/* ------------------------------------------------------------------
   Kotak masuk (hanya baca + ubah status + hapus)
   ------------------------------------------------------------------ */

export type Inbox = {
  kunci: string;
  label: string;
  tabel: string;
  pk: string;
  urut: string;
  kolom: { nama: string; label: string }[];
  detail: { nama: string; label: string }[];
};

export const inboxes: Inbox[] = [
  {
    kunci: "lamaran",
    label: "Lamaran Kerja",
    tabel: "lamaran",
    pk: "id",
    urut: "id DESC",
    kolom: [
      { nama: "kode", label: "Kode" },
      { nama: "nama", label: "Nama" },
      { nama: "posisi", label: "Posisi" },
      { nama: "status", label: "Status" },
    ],
    detail: [
      { nama: "kode", label: "Kode" },
      { nama: "nama", label: "Nama" },
      { nama: "telepon", label: "Telepon" },
      { nama: "email", label: "Email" },
      { nama: "posisi", label: "Posisi" },
      { nama: "pesan", label: "Ringkasan" },
      { nama: "dibuat", label: "Dikirim" },
      { nama: "ip", label: "IP" },
    ],
  },
  {
    kunci: "survei",
    label: "Survei Kepuasan",
    tabel: "survei",
    pk: "id",
    urut: "id DESC",
    kolom: [
      { nama: "nama", label: "Nama" },
      { nama: "unit", label: "Unit" },
      { nama: "nilai", label: "Nilai" },
      { nama: "status", label: "Status" },
      { nama: "dibuat", label: "Masuk" },
    ],
    detail: [
      { nama: "nama", label: "Nama" },
      { nama: "unit", label: "Unit / poliklinik" },
      { nama: "nilai", label: "Nilai rata-rata" },
      { nama: "r_pendaftaran", label: "Pendaftaran (1-5)" },
      { nama: "r_dokter", label: "Dokter (1-5)" },
      { nama: "r_perawat", label: "Perawat & petugas (1-5)" },
      { nama: "r_fasilitas", label: "Fasilitas (1-5)" },
      { nama: "r_kebersihan", label: "Kebersihan (1-5)" },
      { nama: "komentar", label: "Yang sudah baik" },
      { nama: "saran", label: "Perlu diperbaiki" },
      { nama: "status", label: "Status" },
      { nama: "dibuat", label: "Masuk" },
      { nama: "ip", label: "IP" },
    ],
  },
];

export function cariInbox(kunci: string): Inbox | undefined {
  return inboxes.find((i) => i.kunci === kunci);
}

export const statusPilihan = ["baru", "diproses", "selesai", "ditolak"];
