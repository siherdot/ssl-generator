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

    // ---- poli ----
    let idPoli = petaPoli.get(kodePoli);
    if (!idPoli) {
      const ada = await one<{ id_poli: string }>(
        "SELECT id_poli FROM poli WHERE kode_simrs = ?",
        [kodePoli]
      );
      if (ada) {
        idPoli = ada.id_poli;
      } else {
        let id = kodePoli;
        if (await one("SELECT 1 FROM poli WHERE id_poli = ?", [id])) id = `${kodePoli}-S`.slice(0, 40);
        const namaPoli = teks(b.poli, 120) || `POLI ${kodePoli}`;
        await pool.execute(
          `INSERT INTO poli (id_poli, nama_poli, ket, images, kode_simrs)
           VALUES (?, ?, '', '', ?)
           ON CONFLICT (id_poli) DO UPDATE SET nama_poli = EXCLUDED.nama_poli`,
          [id, namaPoli, kodePoli]
        );
        poliBaru += 1;
        idPoli = id;
      }
      petaPoli.set(kodePoli, idPoli);
    }

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
        await pool.execute(
          `INSERT INTO dokter (id_dokter, nama_dokter, ket, images, id_poli, kode_simrs)
           VALUES (?, ?, '', '', ?, ?)`,
          [id, namaDokter, idPoli, kodeDokter]
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
