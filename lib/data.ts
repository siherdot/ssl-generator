import { getPool, one, rows, type Param } from "./db";
import { urlGambar } from "./gambar";
import { rumahSakitGrup } from "./site";

/* ------------------------------------------------------------------
   Tipe mengikuti skema database lama (lihat information_schema)
   ------------------------------------------------------------------ */

export type Company = {
  company_id: string;
  company_name: string;
  phone: string;
  fax: string;
  email: string;
  alamat: string;
  igd_phone: string;
  slogan: string;
  hospital_name: string;
  logo_hospital: string;
  favicon_hospital: string;
  company_description: string;
  link_youtube_profile: string;
  visi: string;
  misi: string;
  company_description_en?: string;
  visi_en?: string;
  misi_en?: string;
};

export type Poli = {
  ket_en?: string;
  nama_poli_en?: string;
  id_poli: string;
  nama_poli: string;
  ket: string;
  images: string;
  jumlah_dokter?: number;
};

export type JadwalRingkas = { hari: string; jam: string };

export type Dokter = {
  id_dokter: string;
  nama_dokter: string;
  ket: string;
  images: string;
  id_poli: string;
  nama_poli?: string;
  jadwal?: JadwalRingkas[];
};

export type Jadwal = {
  id_jadwal: string;
  hari: string;
  jammulai: string;
  jamselesai: string;
  id_dokter: string;
  id_poli: string;
  nama_poli?: string;
};

export type Facility = {
  facility_name_en?: string;
  facility_description_en?: string;
  id_facility: string;
  facility_name: string;
  facility_description: string;
  facility_image: string;
};

export type HospitalUnit = {
  hospital_id: string;
  title: string;
  content: string;
  link_hospital: string;
  images: string;
};

export type News = {
  title_en?: string;
  content_en?: string;
  news_id: string;
  title: string;
  content: string;
  create_date: string;
  news_images: string;
};

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Jumat", "Sabtu", "Minggu"] as const;
export const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu"];

/** 'Senin, Sabtu' / ' Selasa' -> ['Senin','Sabtu'] */
export function pecahHari(hari: string | null | undefined): string[] {
  if (!hari) return [];
  return hari
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h.length > 0)
    .map((h) => (h.toLowerCase() === "jumat" ? "Jum'at" : h));
}

/** '09:00:00' -> '09.00' */
export function jamRapi(jam: string | null | undefined): string {
  if (!jam) return "";
  const [h, m] = jam.split(":");
  return `${h}.${m}`;
}

/**
 * Kolom timestamp di database disimpan sebagai UTC tanpa zona ("2026-11-11 11:41:34").
 * Kalau diparsing apa adanya, `new Date()` menganggapnya jam lokal container (WIB)
 * sehingga tampil 7 jam lebih tua. Helper ini membacanya sebagai UTC.
 */
export function waktuDb(nilai: string | null | undefined): Date | null {
  if (!nilai) return null;
  const teks = String(nilai).trim();
  if (!teks || teks.startsWith("0000-00-00")) return null;
  const adaZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(teks);
  const d = new Date(adaZona ? teks : `${teks.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** '0000-00-00 00:00:00' dianggap tidak ada tanggal */
export function tanggalRapi(value: string | null | undefined): string | null {
  const d = waktuDb(value);
  if (!d) return null;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}

export function gambar(nama: string | null | undefined, fallback = "/images/arsip/logo2.png"): string {
  return urlGambar(nama, fallback);
}

/* ------------------------------------------------------------------
   Query
   ------------------------------------------------------------------ */

export function getCompany() {
  return one<Company>("SELECT * FROM company WHERE company_id = ? LIMIT 1", ["company-1"]);
}

/** Logo & ikon tab: dari dashboard bila diisi, kalau kosong pakai berkas bawaan. */
function berkasIdentitas(nilai: string | null | undefined, bawaan: string): string {
  const bersih = (nilai ?? "").trim();
  if (bersih === "") return bawaan;
  if (bersih.startsWith("/") || bersih.startsWith("http")) return bersih;
  return urlGambar(bersih, bawaan);
}

export async function getIdentitas() {
  let company: Company | null = null;
  try {
    company = await getCompany();
  } catch (e) {
    console.warn("[data] gagal baca identitas situs:", (e as Error).message);
  }
  return {
    nama: company?.hospital_name?.trim() || "RSU Mahkota Bidadari",
    logo: berkasIdentitas(company?.logo_hospital, "/images/logo-rsub.png"),
    favicon: berkasIdentitas(company?.favicon_hospital, "/images/arsip/logo2.png"),
  };
}

export function getPoliList() {
  return rows<Poli>(
    `SELECT p.*, (SELECT COUNT(*) FROM dokter d WHERE d.id_poli = p.id_poli) AS jumlah_dokter
       FROM poli p
      ORDER BY p.nama_poli`
  );
}

export function getPoli(id: string) {
  return one<Poli>("SELECT * FROM poli WHERE id_poli = ? LIMIT 1", [id]);
}

/**
 * Daftar dokter + poli + jadwal ringkas.
 * Satu dokter bisa punya beberapa baris jadwal, jadi hasil query dikelompokkan
 * per dokter (kalau tidak, kartu dokter tampil berulang di halaman).
 */
export async function getDokterList(opts: { q?: string; poli?: string; hari?: string } = {}) {
  const where: string[] = [];
  const params: Param[] = [];

  if (opts.q) {
    where.push("(d.nama_dokter LIKE ? OR p.nama_poli LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.poli) {
    where.push("d.id_poli = ?");
    params.push(opts.poli);
  }
  if (opts.hari) {
    where.push("REPLACE(j.hari, ' ', '') LIKE ?");
    params.push(`%${opts.hari}%`);
  }

  const sql = `
    SELECT d.id_dokter, d.nama_dokter, d.ket, d.images, d.id_poli, p.nama_poli,
           j.hari, j.jammulai, j.jamselesai
      FROM dokter d
      LEFT JOIN poli p ON p.id_poli = d.id_poli
      LEFT JOIN jadwal_dokter j ON j.id_dokter = d.id_dokter
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY p.nama_poli, d.nama_dokter, j.hari, j.jammulai`;

  const raw = await rows<
    Dokter & { hari: string | null; jammulai: string | null; jamselesai: string | null }
  >(sql, params);

  const peta = new Map<string, Dokter>();
  for (const r of raw) {
    let dokter = peta.get(r.id_dokter);
    if (!dokter) {
      dokter = {
        id_dokter: r.id_dokter,
        nama_dokter: r.nama_dokter,
        ket: r.ket,
        images: r.images,
        id_poli: r.id_poli,
        nama_poli: r.nama_poli,
        jadwal: [],
      };
      peta.set(r.id_dokter, dokter);
    }
    if (r.hari && r.jammulai) {
      dokter.jadwal!.push({ hari: r.hari, jam: `${r.jammulai}-${r.jamselesai}` });
    }
  }

  return [...peta.values()];
}

export function getDokter(id: string) {
  return one<Dokter & { nama_poli: string }>(
    `SELECT d.*, p.nama_poli
       FROM dokter d
       LEFT JOIN poli p ON p.id_poli = d.id_poli
      WHERE d.id_dokter = ? LIMIT 1`,
    [id]
  );
}

export function getJadwalDokter(idDokter: string) {
  return rows<Jadwal>(
    `SELECT j.*, p.nama_poli
       FROM jadwal_dokter j
       LEFT JOIN poli p ON p.id_poli = j.id_poli
      WHERE j.id_dokter = ?
      ORDER BY j.hari, j.jammulai`,
    [idDokter]
  );
}

export function getFacilityList() {
  return rows<Facility>("SELECT * FROM facility ORDER BY facility_name");
}

export function getHospitalList() {
  return rows<HospitalUnit>("SELECT * FROM hospital ORDER BY title");
}

/** Berita: tanggal kosong diletakkan paling akhir. */
export function getNewsList(limit?: number) {
  // PostgreSQL tidak mengenal literal '0000-00-00 00:00:00'; tanggal nol
  // disimpan sebagai NULL, jadi urutannya memakai IS NULL.
  const sql = `SELECT news_id, title, title_en, content, content_en, create_date, news_images
                 FROM news
                ORDER BY (create_date IS NULL), create_date DESC, news_id DESC
                ${limit ? "LIMIT ?" : ""}`;
  return rows<News>(sql, limit ? [limit] : []);
}

export function getNews(id: string) {
  return one<News>("SELECT * FROM news WHERE news_id = ? LIMIT 1", [id]);
}

export function hitungRingkas() {
  return one<{ dokter: number; poli: number; fasilitas: number; berita: number }>(
    `SELECT (SELECT COUNT(*) FROM dokter) AS dokter,
            (SELECT COUNT(*) FROM poli) AS poli,
            (SELECT COUNT(*) FROM facility) AS fasilitas,
            (SELECT COUNT(*) FROM news) AS berita`
  );
}

/** Bersihkan HTML dari admin: buang script/iframe/atribut event. */
export function bersihkanHtml(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

/* ------------------------------------------------------------------
   Fase C: tabel baru (penjamin, promo, testimoni, pendaftaran)
   ------------------------------------------------------------------ */

export type Penjamin = { id: number; nama: string; kategori: string; logo: string };

export type GrupRs = {
  id: number;
  nama: string;
  kota: string;
  /** "/" untuk situs ini sendiri, URL http untuk situs lain, "" belum tersedia. */
  url: string;
  foto: string;
};
export type Promo = {
  id: number;
  judul: string;
  deskripsi: string;
  gambar: string;
  link: string;
  mulai: string | null;
  selesai: string | null;
};
export type Testimoni = {
  id: number;
  nama: string;
  isi: string;
  foto: string;
  rating: number;
  tanggal: string | null;
};

export function getPenjamin() {
  return rows<Penjamin>(
    "SELECT id, nama, kategori, logo FROM penjamin WHERE aktif = 1 ORDER BY urutan, nama"
  );
}

/** Daftar rumah sakit grup. Bila tabel belum terisi, pakai daftar bawaan. */
export async function getGrupRs(): Promise<GrupRs[]> {
  try {
    const isi = await rows<GrupRs>(
      "SELECT id, nama, kota, url, foto FROM grup_rs WHERE aktif = 1 ORDER BY urutan, nama"
    );
    if (isi.length > 0) return isi;
  } catch {
    /* tabel belum ada — jatuh ke daftar bawaan */
  }
  return rumahSakitGrup.map((rs, i) => ({
    id: i + 1,
    nama: rs.nama,
    kota: rs.kota,
    url: rs.url,
    foto: "",
  }));
}

export function getPromoAktif(limit = 3) {
  return rows<Promo>(
    `SELECT id, judul, deskripsi, gambar, link, mulai, selesai
       FROM promo
      WHERE aktif = 1 AND (selesai IS NULL OR selesai >= CURDATE())
      ORDER BY (mulai IS NULL), mulai DESC
      LIMIT ?`,
    [limit]
  );
}

export function getTestimoni(limit = 6) {
  return rows<Testimoni>(
    `SELECT id, nama, isi, foto, rating, tanggal
       FROM testimoni
      WHERE tampil = 1
      ORDER BY (tanggal IS NULL), tanggal DESC, id DESC
      LIMIT ?`,
    [limit]
  );
}

/* ------------------------------------------------------------------
   Fase D: karier, lamaran, pesan kontak
   ------------------------------------------------------------------ */

export type Karier = {
  id: number;
  posisi: string;
  unit: string;
  jenis: string;
  deskripsi: string;
  kualifikasi: string;
  dibuat: string | null;
  ditutup: string | null;
};

export function getKarierAktif() {
  return rows<Karier>(
    `SELECT id, posisi, unit, jenis, deskripsi, kualifikasi, dibuat, ditutup
       FROM karier
      WHERE aktif = 1 AND (ditutup IS NULL OR ditutup >= CURDATE())
      ORDER BY (dibuat IS NULL), dibuat DESC`
  );
}

export type LamaranBaru = {
  nama: string;
  telepon: string;
  email?: string;
  posisi: string;
  pesan?: string;
};

export async function simpanLamaran(data: LamaranBaru, ip: string) {
  const kode = `LMR-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;

  await getPool().execute(
    `INSERT INTO lamaran (kode, nama, telepon, email, posisi, pesan, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [kode, data.nama, data.telepon, data.email || "", data.posisi, data.pesan || "", ip]
  );

  return kode;
}

export type SurveiBaru = {
  nama: string;
  unit: string;
  r_pendaftaran: number;
  r_dokter: number;
  r_perawat: number;
  r_fasilitas: number;
  r_kebersihan: number;
  komentar: string;
  saran: string;
};

/** Simpan jawaban survei kepuasan; `nilai` = rata-rata 5 aspek (1–5). */
export async function simpanSurvei(data: SurveiBaru, ip: string) {
  const nilai =
    (data.r_pendaftaran + data.r_dokter + data.r_perawat + data.r_fasilitas + data.r_kebersihan) / 5;

  await getPool().execute(
    `INSERT INTO survei
       (nama, unit, r_pendaftaran, r_dokter, r_perawat, r_fasilitas, r_kebersihan, nilai, komentar, saran, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nama || "",
      data.unit || "",
      data.r_pendaftaran,
      data.r_dokter,
      data.r_perawat,
      data.r_fasilitas,
      data.r_kebersihan,
      nilai.toFixed(2),
      data.komentar || "",
      data.saran || "",
      ip,
    ]
  );

  return nilai;
}

/** Ringkasan survei untuk halaman admin/dashboard (jumlah + rata-rata). */
export async function getRingkasanSurvei() {
  // AVG() menghasilkan numeric, yang dikirim node-postgres sebagai string.
  // Cast ke float8 supaya sampai ke UI sebagai angka.
  return one<{ jumlah: number; rata: number }>(
    "SELECT COUNT(*) AS jumlah, COALESCE(AVG(nilai), 0)::float8 AS rata FROM survei"
  );
}

/** Daftar nama poli untuk kebutuhan form (id + nama saja). */
export function getPoliRingkas() {
  return rows<{ id_poli: string; nama_poli: string }>(
    "SELECT id_poli, nama_poli FROM poli ORDER BY nama_poli"
  );
}

/** Foto latar hero: slide_images yang aktif, diputar berurutan di beranda. */
export function getSlideLatar() {
  return rows<{ images: string }>(
    "SELECT images FROM slide_images WHERE aktif = 1 ORDER BY id_slide"
  );
}

/* ------------------------------------------------------------------
   Fase G: ketersediaan tempat tidur (agregat, tanpa data pasien)
   ------------------------------------------------------------------ */

export type Kasur = {
  id: number;
  nama_unit: string;
  kelas: string;
  total: number;
  terisi: number;
  keterangan: string;
  diperbarui: string;
};

export function getKasur() {
  return rows<Kasur>(
    `SELECT id, nama_unit, kelas, total, terisi, keterangan, diperbarui
       FROM kasur
      WHERE aktif = 1
      ORDER BY urutan, nama_unit`
  );
}

/** Waktu pembaruan data paling akhir (null bila belum pernah ada data). */
export function getKasurDiperbarui(): Promise<Kasur | null> {
  return one<Kasur>(
    `SELECT id, nama_unit, kelas, total, terisi, keterangan, diperbarui
       FROM kasur ORDER BY diperbarui DESC LIMIT 1`
  );
}
