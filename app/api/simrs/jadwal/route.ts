import { NextResponse } from "next/server";
import { getPool, one, rows } from "@/lib/db";

/**
 * Endpoint untuk SIMRS mengirim jadwal praktik dokter.
 *
 * POST /api/simrs/jadwal
 * Header: Authorization: Bearer <SIMRS_API_TOKEN>
 * Body: { "list": [ { "kodokter", "nadokter", "kodepos", "poli",
 *                     "hari", "jam_mulai", "jam_selesai" } ] }
 *
 * Bentuk baris sama dengan response GET /doctor-schedules API Eksternal v1,
 * jadi pemanggil bisa meneruskan hasil API apa adanya.
 *
 * Yang dikerjakan:
 *  - poli  : dibuat/diperbarui berdasarkan kodepos (kode_simrs)
 *  - dokter: dibuat/diperbarui berdasarkan kodokter (kode_simrs)
 *  - jadwal: di-upsert berdasarkan kunci kodokter|hari|jam_mulai,
 *            baris SIMRS yang tidak ada lagi di kiriman dihapus
 *
 * Baris tanpa kode_simrs (input manual di dashboard) tidak pernah disentuh.
 */
export const dynamic = "force-dynamic";

type BarisMasuk = {
  kodokter?: unknown;
  nadokter?: unknown;
  kodepos?: unknown;
  poli?: unknown;
  hari?: unknown;
  jam_mulai?: unknown;
  jam_selesai?: unknown;
};

const HARI: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jum'at",
  "JUM'AT": "Jum'at",
  SABTU: "Sabtu",
  MINGGU: "Minggu",
};

/** Poli untuk kode SIMRS yang tidak menyertakan nama poli. */
const POLI_CADANGAN = "POLI UMUM";

function teks(v: unknown, maks = 255): string {
  return String(v ?? "").trim().slice(0, maks);
}

function jamRapi(v: unknown): string | null {
  const m = /^(\d{1,2})\s*[:.]\s*(\d{2})/.exec(teks(v));
  if (!m) return null;
  const jam = Number(m[1]);
  const menit = Number(m[2]);
  if (jam > 23 || menit > 59) return null;
  return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}`;
}

function tokenCocok(request: Request): boolean {
  const harapan = process.env.SIMRS_API_TOKEN;
  if (!harapan) return false;
  const header = request.headers.get("authorization") ?? "";
  const dikirim = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (dikirim.length !== harapan.length) return false;
  let beda = 0;
  for (let i = 0; i < harapan.length; i++) beda |= harapan.charCodeAt(i) ^ dikirim.charCodeAt(i);
  return beda === 0;
}

/** id_jadwal baru: JD + nomor urut 4 digit di atas angka terbesar yang ada. */
async function idJadwalBaru(): Promise<string> {
  const h = await one<{ n: number | null }>(
    "SELECT MAX(NULLIF(regexp_replace(id_jadwal, '\\D', '', 'g'), '')::int) AS n FROM jadwal_dokter"
  );
  return `JD${String(Number(h?.n ?? 0) + 1).padStart(4, "0")}`;
}

/**
 * Nama poli SIMRS ("POLI JANTUNG") dan nama poli situs ("POLIKLINIK JANTUNG")
 * berbeda kata sambungnya. Bandingkan inti namanya saja supaya tidak lahir
 * poli kembar di situs.
 */
const KATA_UMUM = new Set([
  "poli",
  "poliklinik",
  "klinik",
  "instalasi",
  "unit",
  "medik",
  "spesialis",
  "dan",
  "lainnya",
]);

function intiNama(nama: string): Set<string> {
  const kata = nama
    .toLowerCase()
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter((k) => k.length > 2 && !KATA_UMUM.has(k));
  return new Set(kata);
}

/** Cocok bila seluruh kata nama yang lebih pendek ada di nama yang lain. */
function namaSerupa(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  const [kecil, besar] = a.size <= b.size ? [a, b] : [b, a];
  for (const k of kecil) if (!besar.has(k)) return false;
  return true;
}

export async function POST(request: Request) {
  if (!process.env.SIMRS_API_TOKEN) {
    return NextResponse.json(
      { ok: false, pesan: "Endpoint belum diaktifkan. Isi SIMRS_API_TOKEN di environment." },
      { status: 503 }
    );
  }
  if (!tokenCocok(request)) {
    return NextResponse.json({ ok: false, pesan: "Token tidak valid." }, { status: 401 });
  }

  let body: { list?: BarisMasuk[] };
  try {
    body = (await request.json()) as { list?: BarisMasuk[] };
  } catch {
    return NextResponse.json({ ok: false, pesan: "Body harus JSON." }, { status: 400 });
  }

  const daftar = Array.isArray(body.list) ? body.list : [];
  if (daftar.length === 0) {
    return NextResponse.json({ ok: false, pesan: "Field 'list' kosong." }, { status: 422 });
  }

  const pool = getPool();
  const petaPoli = new Map<string, string>();
  const petaDokter = new Map<string, string>();
  const kunciDipakai = new Set<string>();
  const dilewati: string[] = [];

  let poliBaru = 0;
  let dokterBaru = 0;
  let jadwalBaru = 0;
  let jadwalDiperbarui = 0;

  /** Poli utama dokter = poli bernama pertama di kiriman (bukan poli cadangan). */
  const poliUtama = new Map<string, { kode: string; nama: string }>();
  for (const b of daftar) {
    const kd = teks(b.kodokter, 40);
    const nama = teks(b.poli, 120);
    if (kd && nama && !poliUtama.has(kd)) poliUtama.set(kd, { kode: teks(b.kodepos, 40), nama });
  }

  /** Cari/buat poli situs untuk satu kode + nama poli SIMRS. */
  async function poliSitus(kodePoli: string, namaPoli: string): Promise<string> {
    const tersimpan = petaPoli.get(kodePoli);
    if (tersimpan) return tersimpan;

    let id: string;
    const ada = await one<{ id_poli: string }>(
      "SELECT id_poli FROM poli WHERE kode_simrs = ?",
      [kodePoli]
    );
    if (ada) {
      id = ada.id_poli;
    } else {
      // Belum pernah dipetakan: cari poli situs bernama serupa dulu, supaya
      // "POLI JANTUNG" menumpang di "POLIKLINIK JANTUNG" dan tak jadi poli kembar.
      const semua = await rows<{ id_poli: string; nama_poli: string }>(
        "SELECT id_poli, nama_poli FROM poli"
      );
      const inti = intiNama(namaPoli);
      // ambil yang paling dekat: "POLI SARAF" harus ke POLIKLINIK SARAF,
      // bukan ke POLIKLINIK BEDAH SARAF
      const serupa = semua
        .map((p) => ({ p, inti: intiNama(p.nama_poli) }))
        .filter((x) => namaSerupa(inti, x.inti))
        .sort((a, b) => Math.abs(a.inti.size - inti.size) - Math.abs(b.inti.size - inti.size))[0]?.p;
      if (serupa) {
        id = serupa.id_poli;
      } else {
        let baru = kodePoli || "P-SIMRS";
        if (await one("SELECT 1 FROM poli WHERE id_poli = ?", [baru])) baru = `${baru}-S`.slice(0, 40);
        await pool.execute(
          `INSERT INTO poli (id_poli, nama_poli, ket, images, kode_simrs)
           VALUES (?, ?, '', '', ?)
           ON CONFLICT (id_poli) DO UPDATE SET nama_poli = EXCLUDED.nama_poli`,
          [baru, namaPoli, kodePoli]
        );
        poliBaru += 1;
        id = baru;
      }
    }
    petaPoli.set(kodePoli, id);
    return id;
  }

  for (const b of daftar) {
    const kodeDokter = teks(b.kodokter, 40);
    const namaDokter = teks(b.nadokter, 100);
    const kodePoli = teks(b.kodepos, 40);
    const hari = HARI[teks(b.hari, 20).toUpperCase()];
    const mulai = jamRapi(b.jam_mulai);
    const selesai = jamRapi(b.jam_selesai);

    if (!kodeDokter || !namaDokter || !kodePoli || !hari || !mulai || !selesai) {
      dilewati.push(`${kodeDokter || "?"} ${hari || String(b.hari ?? "?")}`);
      continue;
    }

    const idPoli = await poliSitus(kodePoli, teks(b.poli, 120) || POLI_CADANGAN);

    // ---- dokter ----
    let idDokter = petaDokter.get(kodeDokter);
    if (!idDokter) {
      const ada = await one<{ id_dokter: string }>(
        "SELECT id_dokter FROM dokter WHERE kode_simrs = ?",
        [kodeDokter]
      );
      if (ada) {
        idDokter = ada.id_dokter;
      } else {
        let id = kodeDokter;
        if (await one("SELECT 1 FROM dokter WHERE id_dokter = ?", [id])) id = `${kodeDokter}-S`.slice(0, 100);
        const utama = poliUtama.get(kodeDokter);
        const idPoliDokter = utama ? await poliSitus(utama.kode, utama.nama) : idPoli;
        await pool.execute(
          `INSERT INTO dokter (id_dokter, nama_dokter, ket, images, id_poli, kode_simrs)
           VALUES (?, ?, '', '', ?, ?)`,
          [id, namaDokter, idPoliDokter, kodeDokter]
        );
        dokterBaru += 1;
        idDokter = id;
      }
      petaDokter.set(kodeDokter, idDokter);
    }

    // ---- jadwal ----
    const kunci = `${kodeDokter}|${hari}|${mulai}`;
    kunciDipakai.add(kunci);
    const adaJadwal = await one<{ id_jadwal: string }>(
      "SELECT id_jadwal FROM jadwal_dokter WHERE kode_simrs = ?",
      [kunci]
    );
    if (adaJadwal) {
      await pool.execute(
        `UPDATE jadwal_dokter
            SET hari = ?, jammulai = ?, jamselesai = ?, id_dokter = ?, id_poli = ?
          WHERE id_jadwal = ?`,
        [hari, mulai, selesai, idDokter, idPoli, adaJadwal.id_jadwal]
      );
      jadwalDiperbarui += 1;
    } else {
      await pool.execute(
        `INSERT INTO jadwal_dokter (id_jadwal, hari, jammulai, jamselesai, id_dokter, id_poli, kode_simrs)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [await idJadwalBaru(), hari, mulai, selesai, idDokter, idPoli, kunci]
      );
      jadwalBaru += 1;
    }
  }

  // buang jadwal SIMRS yang sudah tidak ada di kiriman (jadwal manual tetap)
  let dihapus = 0;
  const tersimpan = await rows<{ id_jadwal: string; kode_simrs: string }>(
    "SELECT id_jadwal, kode_simrs FROM jadwal_dokter WHERE kode_simrs IS NOT NULL"
  );
  for (const j of tersimpan) {
    if (!kunciDipakai.has(j.kode_simrs)) {
      await pool.execute("DELETE FROM jadwal_dokter WHERE id_jadwal = ?", [j.id_jadwal]);
      dihapus += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    diterima: daftar.length,
    poli_baru: poliBaru,
    dokter_baru: dokterBaru,
    jadwal_baru: jadwalBaru,
    jadwal_diperbarui: jadwalDiperbarui,
    jadwal_dihapus: dihapus,
    dilewati,
  });
}
