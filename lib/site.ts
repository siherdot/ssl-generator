export const site = {
  name: "RSU Mahkota Bidadari",
  shortName: "RSUM",
  slogan: "Kesehatan Anda Merupakan Prioritas Utama Kami",
  address:
    "Jl. Sisingamangaraja No. 146, Desa Paluh Manis, Kec. Gebang, Kab. Langkat, Sumatera Utara 20873",
  phone: "0812-6937-8222",
  igd: "0853-5926-7962",
  whatsapp: "6281269378222",
  whatsappLabel: "0812 6937 8222",
  email: "info@rsumahkotabidadari.com",
  founded: 2021,
  mapsQuery: "RSU Mahkota Bidadari Langkat",
  /** Koordinat dari embed Google Maps situs lama (titik RS, bukan perkiraan). */
  koordinat: { lat: 3.9740316, lon: 98.3454313 },
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
    /** Judul kelompok di dalam dropdown (mis. "Untuk Pasien"). */
    grup?: string;
  }[];
};

/** Daftar rumah sakit grup Bidadari (dipakai halaman & menu navigasi). */
export const rumahSakitGrup: RumahSakitGrup[] = [
  {
    nama: "RSU Bidadari Binjai",
    kota: "Binjai, Sumatera Utara",
    url: "https://rsu.bidadari.co.id",
  },
  {
    nama: "RSU Bidadari Batubara",
    kota: "Batubara, Sumatera Utara",
    url: "https://rsubatubara.bidadari.co.id",
  },
  {
    nama: "RSU Mahkota Bidadari",
    kota: "Kabupaten Langkat, Sumatera Utara",
    url: "/",
    internal: true,
  },
  {
    nama: "RSU Putri Bidadari",
    kota: "Kabupaten Langkat, Sumatera Utara",
    url: "https://rsu.putribidadari.co.id",
  },
  {
    nama: "RSU Putri Bidadari Aceh",
    kota: "Aceh Besar, Aceh",
    url: "",
  },
];

export const navigation: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Cari Dokter", href: "/dokter" },
  {
    label: "Layanan",
    href: "/layanan",
    children: [
      { label: "Poliklinik", href: "/layanan/poliklinik", description: "Layanan rawat jalan per spesialisasi" },
      { label: "Rawat Inap", href: "/layanan/rawat-inap", description: "Kelas dan fasilitas kamar" },
      { label: "Penunjang Medis", href: "/layanan/penunjang", description: "Laboratorium, radiologi, farmasi" },
      { label: "Medical Check Up", href: "/layanan/mcu", description: "Paket pemeriksaan berkala" },
      { label: "Fasilitas Umum", href: "/fasilitas", description: "Parkir, musala, ambulans" },
    ],
  },
  {
    label: "Informasi",
    href: "/informasi",
    children: [
      // Untuk Pasien
      {
        label: "Ketersediaan Tempat Tidur",
        href: "/informasi/ketersediaan-kamar",
        description: "Cek kamar rawat inap yang kosong",
        grup: "Untuk Pasien",
      },
      { label: "Alur Pendaftaran", href: "/informasi/alur-pendaftaran", grup: "Untuk Pasien" },
      { label: "Asuransi & Penjamin", href: "/informasi/asuransi", grup: "Untuk Pasien" },
      { label: "Pertanyaan Umum (FAQ)", href: "/informasi/faq", grup: "Untuk Pasien" },
      // Untuk Profesional
      { label: "Karier", href: "/informasi/karier", grup: "Untuk Profesional" },
      // Untuk Umum
      { label: "Berita & Kegiatan", href: "/informasi/berita", grup: "Untuk Umum" },
      { label: "Tentang Kami", href: "/tentang", grup: "Untuk Umum" },
      { label: "Kontak & Survei Kepuasan", href: "/kontak", grup: "Untuk Umum" },
    ],
  },
  {
    label: "Rumah Sakit Kami",
    href: "/rumah-sakit-kami",
    children: rumahSakitGrup.map((rs) => ({
      label: rs.nama,
      href: rs.url || "/rumah-sakit-kami",
    })),
  },
];

export const quickActions = [
  {
    title: "Daftar Mobile JKN",
    description: "Pendaftaran BPJS lewat aplikasi JKN",
    href: "/daftar-online",
    icon: "calendar",
  },
  {
    title: "Jadwal Dokter",
    description: "Cek praktik hari ini",
    href: "/dokter",
    icon: "stethoscope",
  },
  {
    title: "Penjamin & Asuransi",
    description: "Cek kerja sama rekanan",
    href: "/informasi/asuransi",
    icon: "shield",
  },
  {
    title: "Ketersediaan Kamar",
    description: "Cek tempat tidur kosong",
    href: "/informasi/ketersediaan-kamar",
    icon: "bed",
  },
] as const;

export type RumahSakitGrup = {
  nama: string;
  kota: string;
  /** Kosong = alamat situs belum tersedia. */
  url: string;
  /** true = rumah sakit ini adalah situs yang sedang dibuka. */
  internal?: boolean;
};

/** Grup rumah sakit Bidadari. `url` kosong = alamat belum tersedia. */
