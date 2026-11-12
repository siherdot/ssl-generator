/**
 * Kamus dua bahasa (ID/EN) untuk bagian antarmuka situs.
 *
 * Prinsip: konten dari database (nama dokter, jadwal, berita, fasilitas) tetap
 * berbahasa Indonesia; yang diterjemahkan adalah teks tetap milik antarmuka
 * (menu, tombol, judul seksi, label).
 *
 * Pemakaian di komponen server/klien:
 *   const lang = await bacaBahasa();        // "id" | "en"
 *   t(lang, "hero.judul")                   // string
 *   navLabel(lang, item.href, item.label)   // label menu
 */
export type Lang = "id" | "en";
export const KUKI_BAHASA = "bahasa";

type Isi = Record<string, string>;

const id: Isi = {

  /* navigasi & tautan (dikunci per href) */
  "nav./": "Beranda",
  "nav./dokter": "Cari Dokter",
  "nav./layanan": "Layanan",
  "nav./layanan/poliklinik": "Poliklinik",
  "nav./layanan/rawat-inap": "Rawat Inap",
  "nav./layanan/penunjang": "Penunjang Medis",
  "nav./layanan/mcu": "Medical Check Up",
  "nav./fasilitas": "Fasilitas Umum",
  "nav./informasi": "Informasi",
  "nav./informasi/ketersediaan-kamar": "Ketersediaan Tempat Tidur",
  "nav./informasi/alur-pendaftaran": "Alur Pendaftaran",
  "nav./informasi/asuransi": "Asuransi & Penjamin",
  "nav./informasi/faq": "Pertanyaan Umum (FAQ)",
  "nav./informasi/karier": "Karier",
  "nav./informasi/berita": "Berita",
  "nav./rumah-sakit-kami": "Rumah Sakit Kami",
  "nav./tentang": "Tentang",
  "nav./kontak": "Kontak",
  "nav.grup.Untuk Umum": "Untuk Umum",
  "nav.grup.Untuk Pasien": "Untuk Pasien",
  "nav.grup.Untuk Profesional": "Untuk Profesional",
  "nav.grup.Lainnya": "Lainnya",

  /* bilah atas & tombol umum */
  "umum.igd": "IGD 24 Jam",
  "umum.igdSingkat": "IGD",
  "umum.cari": "Cari",
  "umum.cariDokter": "Cari dokter",
  "umum.cariDokterAtauLayanan": "Cari dokter atau layanan…",
  "umum.cariSingkat": "Cari…",
  "umum.daftarJkn": "Daftar via JKN",
  "umum.lihatProfil": "Lihat Profil",
  "umum.lihatSemua": "Lihat semua",
  "umum.bukaMenu": "Buka menu",
  "umum.tutupMenu": "Tutup menu",
  "umum.navigasiUtama": "Navigasi utama",
  "umum.navigasiSeluler": "Navigasi seluler",
  "umum.aksiCepat": "Aksi cepat",
  "umum.lewatiKeKonten": "Langsung ke konten",
  "umum.bahasa": "Bahasa",
  "umum.beranda": "beranda",

  /* hero */
  "hero.sejak": "Sejak",
  "hero.judul": "Kesehatan Anda Merupakan Prioritas Utama Kami",
  "hero.isi":
    "Layanan UGD 24 jam, rawat jalan, rawat inap, dan penunjang medis dengan tenaga kesehatan profesional di Kabupaten Langkat, Sumatera Utara.",
  "hero.daftar": "Daftar via JKN",

  /* aksi cepat */
  "quick./daftar-online.judul": "Daftar Mobile JKN",
  "quick./daftar-online.isi": "Pendaftaran BPJS lewat aplikasi JKN",
  "quick./dokter.judul": "Jadwal Dokter",
  "quick./dokter.isi": "Cek praktik hari ini",
  "quick./informasi/asuransi.judul": "Penjamin & Asuransi",
  "quick./informasi/asuransi.isi": "Cek kerja sama rekanan",
  "quick./informasi/ketersediaan-kamar.judul": "Ketersediaan Kamar",
  "quick./informasi/ketersediaan-kamar.isi": "Cek tempat tidur kosong",

  /* beranda */
  "home.tentang.label": "Tentang Kami",
  "home.tentang.judul": "Rumah sakit keluarga di jantung Kabupaten Langkat",
  "home.tentang.isi":
    "RSU Mahkota Bidadari melayani masyarakat Kabupaten Langkat dengan dokter umum dan spesialis, " +
    "didukung layanan penunjang seperti laboratorium, radiologi, dan rehabilitasi medik.",
  "home.tentang.profil": "Profil Rumah Sakit",
  "home.tentang.visi": "Visi & Misi",
  "home.layanan.judul": "Layanan utama",
  "home.sect.layanan": "Layanan",
  "home.sect.layananJudul": "Poliklinik & Spesialisasi",
  "home.sect.tim": "Tim Medis",
  "home.sect.timJudul": "Dokter Spesialis",
  "home.sect.informasi": "Informasi",
  "home.sect.informasiJudul": "Berita & Kegiatan",
  "home.sect.penawaran": "Penawaran",
  "home.sect.penawaranJudul": "Promo & Layanan Unggulan",
  "home.sect.pengalaman": "Pengalaman Pasien",
  "home.sect.pengalamanJudul": "Kata Pasien Kami",
  "home.cta.lihatDokter": "Lihat dokter",
  "home.cta.baca": "Baca",
  "home.poli.dokter": "dokter",
  "home.poli.rawatJalan": "Layanan rawat jalan",
  "home.kamar.lihat": "Lihat rincian per kelas",
  "hub.label": "Hubungi Kami",
  "chat.judul": "Tanya Asisten RS",
  "chat.sub": "Dijawab otomatis · 24 jam",
  "chat.sapa": "Halo! Saya asisten rumah sakit ini. Silakan tanya jadwal dokter, poliklinik, layanan, atau cara mendaftar.",
  "chat.ketik": "Asisten sedang mengetik…",
  "chat.placeholder": "Tulis pertanyaan…",
  "chat.kirim": "Kirim",
  "chat.tutup": "Tutup obrolan",
  "chat.buka": "Buka obrolan asisten",
  "chat.tutupPanel": "Tutup obrolan asisten",
  "chat.gagal": "Maaf, asisten sedang tidak bisa menjawab. Coba lagi sebentar.",
  "chat.putus": "Koneksi terputus. Periksa jaringan lalu coba lagi.",
  "chat.batas": "Batas pertanyaan tercapai. Silakan jeda beberapa menit lagi, atau hubungi kami lewat telepon.",
  "chat.sibuk": "Asisten sedang sibuk. Coba lagi beberapa saat.",
  "chat.kosong": "Pertanyaan kosong atau terlalu panjang (maksimal 1000 huruf).",

  "hub.judul": "Sampaikan kebutuhan dan masukan Anda",
  "hub.isi": "Tim kami siap membantu. Untuk pendaftaran, jadwal dokter, atau informasi layanan, hubungi kanal resmi berikut.",
  "hub.surveiJudul": "Survei & Pengaduan",
  "hub.surveiIsi": "Masukan Anda membantu kami memperbaiki mutu pelayanan rumah sakit.",
  "hub.surveiNama": "Survei Kepuasan",
  "hub.surveiKet": "Penyampaian kritik dan saran",
  "home.statistik.dokter": "Dokter & Spesialis",
  "home.statistik.poli": "Poliklinik",
  "home.statistik.tidur": "Tempat Tidur",
  "home.statistik.tahun": "Tahun Melayani",
  "home.kamar.judul": "Ketersediaan tempat tidur hari ini",
  "home.kamar.kosong": "kosong",
  "home.kamar.dari": "dari",
  "home.kamar.tidur": "tempat tidur",
  "home.kamar.terisi": "terisi",
  "home.kamar.rinci": "Lihat rincian per kelas",

  /* footer */
  "footer.pengunjung": "Untuk Pengunjung",
  "footer.tentang": "Tentang",
  "footer.kontak": "Kontak",
  "footer.telepon": "Telepon",
  "footer.whatsapp": "WhatsApp",
  "footer.alamat": "Alamat",
  "footer.hak": "Seluruh hak cipta dilindungi.",
  "footer.survei": "Survei Kepuasan",
  "footer.maps": "Lihat di Google Maps",
  "footer.slogan": "Kesehatan Anda Merupakan Prioritas Utama Kami",
  "footer.berita": "Berita",
  "footer.karier": "Karier",
  "footer.fasilitas": "Fasilitas",
  "footer.profil": "Profil Rumah Sakit",
  "footer.visi": "Visi & Misi",

  /* halaman dalam (judul & label yang dipakai berulang) */
  "hal.dokter.judul": "Cari Dokter & Jadwal Praktik",
  "hal.dokter.isi": "Jadwal praktik hari ini tampil otomatis. Pilih hari lain bila ingin melihat jadwal berbeda.",
  "hal.dokter.nama": "Nama Dokter atau Layanan",
  "hal.dokter.namaPlaceholder": "contoh: anak, bedah, saraf",
  "hal.dokter.poli": "Poliklinik",
  "hal.dokter.semuaPoli": "Semua poliklinik",
  "hal.dokter.hari": "Hari",
  "hal.dokter.semuaHari": "Semua hari",
  "hal.dokter.semua": "Semua",
  "hal.dokter.hasil": "Menampilkan",
  "hal.dokter.dokter": "dokter",
  "hal.dokter.kosong": "Belum ada dokter yang cocok dengan pencarian ini.",
  "hari.Senin": "Senin",
  "hari.Selasa": "Selasa",
  "hari.Rabu": "Rabu",
  "hari.Kamis": "Kamis",
  "hari.Jumat": "Jumat",
  "hari.Jum'at": "Jumat",
  "hari.Sabtu": "Sabtu",
  "hari.Minggu": "Minggu",
  "hari.Semua": "Semua hari",
};

const en: Isi = {
  "nav./": "Home",
  "nav./dokter": "Find a Doctor",
  "nav./layanan": "Services",
  "nav./layanan/poliklinik": "Outpatient Clinics",
  "nav./layanan/rawat-inap": "Inpatient Care",
  "nav./layanan/penunjang": "Medical Support",
  "nav./layanan/mcu": "Medical Check-up",
  "nav./fasilitas": "Facilities",
  "nav./informasi": "Information",
  "nav./informasi/ketersediaan-kamar": "Bed Availability",
  "nav./informasi/alur-pendaftaran": "Registration Flow",
  "nav./informasi/asuransi": "Insurance & Guarantors",
  "nav./informasi/faq": "Frequently Asked Questions",
  "nav./informasi/karier": "Careers",
  "nav./informasi/berita": "News",
  "nav./rumah-sakit-kami": "Our Hospitals",
  "nav./tentang": "About",
  "nav./kontak": "Contact",
  "nav.grup.Untuk Umum": "For the Public",
  "nav.grup.Untuk Pasien": "For Patients",
  "nav.grup.Untuk Profesional": "For Professionals",
  "nav.grup.Lainnya": "Others",

  "umum.igd": "24-Hour Emergency",
  "umum.igdSingkat": "ER",
  "umum.cari": "Search",
  "umum.cariDokter": "Search doctors",
  "umum.cariDokterAtauLayanan": "Search doctors or services…",
  "umum.cariSingkat": "Search…",
  "umum.daftarJkn": "Register via JKN",
  "umum.lihatProfil": "View Profile",
  "umum.lihatSemua": "View all",
  "umum.bukaMenu": "Open menu",
  "umum.tutupMenu": "Close menu",
  "umum.navigasiUtama": "Main navigation",
  "umum.navigasiSeluler": "Mobile navigation",
  "umum.aksiCepat": "Quick actions",
  "umum.lewatiKeKonten": "Skip to content",
  "umum.bahasa": "Language",
  "umum.beranda": "home",

  "hero.sejak": "Since",
  "hero.judul": "Your Health Is Our Highest Priority",
  "hero.isi":
    "24-hour emergency care, outpatient and inpatient services, and medical support delivered by " +
    "professional healthcare teams in Langkat Regency, North Sumatra.",
  "hero.daftar": "Register via JKN",

  "quick./daftar-online.judul": "Register with Mobile JKN",
  "quick./daftar-online.isi": "BPJS registration through the JKN app",
  "quick./dokter.judul": "Doctor Schedules",
  "quick./dokter.isi": "Check who is on duty today",
  "quick./informasi/asuransi.judul": "Insurance & Guarantors",
  "quick./informasi/asuransi.isi": "Check our partner insurers",
  "quick./informasi/ketersediaan-kamar.judul": "Room Availability",
  "quick./informasi/ketersediaan-kamar.isi": "See available beds",

  "home.tentang.label": "About Us",
  "home.tentang.judul": "A family hospital in the heart of Langkat Regency",
  "home.tentang.isi":
    "RSU Mahkota Bidadari serves the people of Langkat Regency with general practitioners and " +
    "specialists, supported by laboratory, radiology, and medical rehabilitation services.",
  "home.tentang.profil": "Hospital Profile",
  "home.tentang.visi": "Vision & Mission",
  "home.layanan.judul": "Main services",
  "home.sect.layanan": "Services",
  "home.sect.layananJudul": "Clinics & Specialties",
  "home.sect.tim": "Medical Team",
  "home.sect.timJudul": "Specialist Doctors",
  "home.sect.informasi": "Information",
  "home.sect.informasiJudul": "News & Events",
  "home.sect.penawaran": "Offers",
  "home.sect.penawaranJudul": "Promotions & Featured Services",
  "home.sect.pengalaman": "Patient Experience",
  "home.sect.pengalamanJudul": "What Our Patients Say",
  "home.cta.lihatDokter": "View doctors",
  "home.cta.baca": "Read",
  "home.poli.dokter": "doctors",
  "home.poli.rawatJalan": "Outpatient service",
  "home.kamar.lihat": "See details by class",
  "hub.label": "Contact Us",
  "chat.judul": "Ask the Hospital Assistant",
  "chat.sub": "Automated answers · 24 hours",
  "chat.sapa": "Hello! I am this hospital's assistant. Ask me about doctor schedules, clinics, services, or how to register.",
  "chat.ketik": "Assistant is typing…",
  "chat.placeholder": "Type your question…",
  "chat.kirim": "Send",
  "chat.tutup": "Close chat",
  "chat.buka": "Open assistant chat",
  "chat.tutupPanel": "Close assistant chat",
  "chat.gagal": "Sorry, the assistant cannot answer right now. Please try again shortly.",
  "chat.putus": "Connection lost. Check your network and try again.",
  "chat.batas": "Question limit reached. Please wait a few minutes, or contact us by phone.",
  "chat.sibuk": "The assistant is busy. Please try again in a moment.",
  "chat.kosong": "Question is empty or too long (maximum 1000 characters).",

  "hub.judul": "Tell Us What You Need",
  "hub.isi": "Our team is ready to help. For registration, doctor schedules, or service information, please use the official channels below.",
  "hub.surveiJudul": "Survey & Complaints",
  "hub.surveiIsi": "Your feedback helps us improve the quality of our hospital services.",
  "hub.surveiNama": "Patient Satisfaction Survey",
  "hub.surveiKet": "Submit your feedback and suggestions",

  "home.statistik.dokter": "Doctors & Specialists",
  "home.statistik.poli": "Clinics",
  "home.statistik.tidur": "Beds",
  "home.statistik.tahun": "Years of Service",
  "home.kamar.judul": "Bed availability today",
  "home.kamar.kosong": "available",
  "home.kamar.dari": "of",
  "home.kamar.tidur": "beds",
  "home.kamar.terisi": "occupied",
  "home.kamar.rinci": "See details by class",

  "footer.pengunjung": "For Visitors",
  "footer.tentang": "About",
  "footer.kontak": "Contact",
  "footer.telepon": "Phone",
  "footer.whatsapp": "WhatsApp",
  "footer.alamat": "Address",
  "footer.hak": "All rights reserved.",
  "footer.survei": "Patient Satisfaction Survey",
  "footer.maps": "View on Google Maps",
  "footer.slogan": "Your Health Is Our Highest Priority",
  "footer.berita": "News",
  "footer.karier": "Careers",
  "footer.fasilitas": "Facilities",
  "footer.profil": "Hospital Profile",
  "footer.visi": "Vision & Mission",

  "hal.dokter.judul": "Find a Doctor & Practice Schedule",
  "hal.dokter.isi": "Today's schedule is shown by default. Pick another day to see a different schedule.",
  "hal.dokter.nama": "Doctor or Service Name",
  "hal.dokter.namaPlaceholder": "e.g. paediatric, surgery, neurology",
  "hal.dokter.poli": "Clinic",
  "hal.dokter.semuaPoli": "All clinics",
  "hal.dokter.hari": "Day",
  "hal.dokter.semuaHari": "All days",
  "hal.dokter.semua": "All",
  "hal.dokter.hasil": "Showing",
  "hal.dokter.dokter": "doctors",
  "hal.dokter.kosong": "No doctors match this search yet.",
  "hari.Senin": "Monday",
  "hari.Selasa": "Tuesday",
  "hari.Rabu": "Wednesday",
  "hari.Kamis": "Thursday",
  "hari.Jumat": "Friday",
  "hari.Jum'at": "Friday",
  "hari.Sabtu": "Saturday",
  "hari.Minggu": "Sunday",
  "hari.Semua": "All days",
};

const kamus: Record<Lang, Isi> = { id, en };

/** Ambil teks antarmuka. Kunci yang tidak ada di EN otomatis jatuh ke ID. */
export function t(lang: Lang, kunci: string): string {
  return kamus[lang]?.[kunci] ?? kamus.id[kunci] ?? kunci;
}

/** Label menu berdasarkan href (dipakai navigation & footer). */
export function navLabel(lang: Lang, href: string, cadangan = ""): string {
  return kamus[lang]?.[`nav.${href}`] ?? (cadangan || kamus.id[`nav.${href}`] || href);
}

/** Judul/deskripsi aksi cepat berdasarkan href. */
export function quickLabel(lang: Lang, href: string, jenis: "judul" | "isi", cadangan = ""): string {
  return kamus[lang]?.[`quick.${href}.${jenis}`] ?? cadangan;
}

/** Nama hari (data DB memakai singkatan Indonesia). */
export function namaHari(lang: Lang, hari: string): string {
  return kamus[lang]?.[`hari.${hari}`] ?? hari;
}
