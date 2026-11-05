import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getKasur } from "@/lib/data";

/**
 * Endpoint untuk SIMRS mengirim angka ketersediaan tempat tidur.
 *
 * POST /api/simrs/kasur
 * Header: Authorization: Bearer <SIMRS_API_TOKEN>
 * Body (array, boleh partial — hanya unit yang dikirim yang diperbarui):
 * {
 *   "unit": [
 *     { "nama_unit": "Rawat Inap VIP", "kelas": "VIP", "total": 6, "terisi": 4 },
 *     { "nama_unit": "ICU", "kelas": "ICU", "total": 4, "terisi": 3 }
 *   ]
 * }
 *
 * Aturan: hanya angka agregat. Jangan pernah mengirim identitas pasien.
 * Aktif hanya bila SIMRS_API_TOKEN diisi di environment.
 */
export const dynamic = "force-dynamic";

type UnitMasuk = {
  nama_unit?: unknown;
  kelas?: unknown;
  total?: unknown;
  terisi?: unknown;
  keterangan?: unknown;
  urutan?: unknown;
};

function tokenCocok(request: Request): boolean {
  const harapan = process.env.SIMRS_API_TOKEN;
  if (!harapan) return false;
  const header = request.headers.get("authorization") ?? "";
  const dikirim = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (dikirim.length !== harapan.length) return false;
  // perbandingan waktu-tetap sederhana
  let beda = 0;
  for (let i = 0; i < harapan.length; i++) beda |= harapan.charCodeAt(i) ^ dikirim.charCodeAt(i);
  return beda === 0;
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

  let body: { unit?: UnitMasuk[] };
  try {
    body = (await request.json()) as { unit?: UnitMasuk[] };
  } catch {
    return NextResponse.json({ ok: false, pesan: "Body harus JSON." }, { status: 400 });
  }

  const daftar = Array.isArray(body.unit) ? body.unit : [];
  if (daftar.length === 0) {
    return NextResponse.json({ ok: false, pesan: "Field 'unit' kosong." }, { status: 422 });
  }

  const pool = getPool();
  const hasil: { nama_unit: string; aksi: string }[] = [];

  for (const u of daftar) {
    const nama = String(u.nama_unit ?? "").trim();
    const total = Number(u.total ?? 0);
    const terisi = Number(u.terisi ?? 0);

    if (nama === "" || !Number.isFinite(total) || !Number.isFinite(terisi)) {
      return NextResponse.json(
        { ok: false, pesan: `Data unit tidak valid: ${JSON.stringify(u)}` },
        { status: 422 }
      );
    }
    if (total < 0 || terisi < 0 || terisi > total) {
      return NextResponse.json(
        { ok: false, pesan: `Angka tidak masuk akal untuk "${nama}" (total ${total}, terisi ${terisi}).` },
        { status: 422 }
      );
    }

    const kelas = String(u.kelas ?? "").trim();
    const keterangan = String(u.keterangan ?? "").trim();
    const urutan = Number(u.urutan ?? 99);

    await pool.execute(
      `INSERT INTO kasur (nama_unit, kelas, total, terisi, keterangan, urutan, aktif)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT (nama_unit) DO UPDATE SET
         kelas = EXCLUDED.kelas,
         total = EXCLUDED.total,
         terisi = EXCLUDED.terisi,
         keterangan = EXCLUDED.keterangan,
         urutan = EXCLUDED.urutan,
         diperbarui = CURRENT_TIMESTAMP`,
      [nama, kelas, Math.trunc(total), Math.trunc(terisi), keterangan, Number.isFinite(urutan) ? urutan : 99]
    );

    hasil.push({ nama_unit: nama, aksi: "disimpan" });
  }

  return NextResponse.json({ ok: true, diterima: hasil.length, hasil });
}

/** Ringkasan untuk pengecekan cepat (tanpa token, hanya angka agregat). */
export async function GET() {
  const kasur = await getKasur();
  const total = kasur.reduce((n, k) => n + Number(k.total || 0), 0);
  const terisi = kasur.reduce((n, k) => n + Number(k.terisi || 0), 0);

  return NextResponse.json({
    ok: true,
    total,
    terisi,
    kosong: Math.max(0, total - terisi),
    unit: kasur.map((k) => ({
      nama_unit: k.nama_unit,
      kelas: k.kelas,
      total: Number(k.total),
      terisi: Number(k.terisi),
      kosong: Math.max(0, Number(k.total) - Number(k.terisi)),
      diperbarui: k.diperbarui,
    })),
  });
}
