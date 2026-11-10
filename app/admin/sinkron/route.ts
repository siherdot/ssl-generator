import { NextResponse } from "next/server";
import { adminSekarang } from "@/lib/admin/auth";
import { simrsAmbil } from "@/lib/simrs/klien";

/**
 * Tombol "Sinkron dari SIMRS" di dashboard admin.
 *
 * POST /admin/sinkron?jenis=jadwal|kasur
 *
 * Mengambil data dari SIMRS lalu meneruskannya ke endpoint ingest yang sama
 * dengan yang dipakai cron (POST /api/simrs/jadwal dan /api/simrs/kasur),
 * jadi aturan pencocokan poli/dokter hanya ada di satu tempat.
 */
export const dynamic = "force-dynamic";

/** kelas SIMRS -> pilihan kelas di dashboard */
const KELAS: Record<string, string> = {
  "NICU & INCUBATOR": "NICU",
  VIP: "VIP",
  SATU: "I",
  DUA: "II",
  TIGA: "III",
  HCU: "HCU",
  BAYI: "Bayi",
  ICU: "ICU",
  "RUANG ISOLASI": "Isolasi",
  "ICU ISOLASI": "Isolasi",
};

type UnitMasuk = {
  nama_unit: string;
  kelas: string;
  total: number;
  terisi: number;
  keterangan: string;
  urutan: number;
};

export async function POST(request: Request) {
  if (!(await adminSekarang())) {
    return NextResponse.json({ ok: false, pesan: "Belum masuk sebagai admin." }, { status: 401 });
  }

  const token = process.env.SIMRS_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, pesan: "SIMRS_API_TOKEN belum diisi di environment." },
      { status: 503 }
    );
  }

  const jenis = new URL(request.url).searchParams.get("jenis");

  /** Panggil endpoint ingest internal tanpa lewat jaringan. */
  async function teruskan(path: string, isi: unknown) {
    const kirim = new Request(`http://internal${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(isi),
    });
    const modul = path.endsWith("jadwal")
      ? await import("@/app/api/simrs/jadwal/route")
      : await import("@/app/api/simrs/kasur/route");
    const res = await modul.POST(kirim);
    const data = (await res.json()) as { ok?: boolean; pesan?: string } & Record<string, unknown>;
    if (!res.ok) throw new Error(data.pesan ?? `ingest HTTP ${res.status}`);
    return data;
  }

  try {
    if (jenis === "jadwal") {
      const data = await simrsAmbil<{ list?: unknown[] }>("/doctor-schedules");
      const list = Array.isArray(data.list) ? data.list : [];
      if (list.length === 0) throw new Error("SIMRS mengirim jadwal kosong.");
      const hasil = await teruskan("/api/simrs/jadwal", { list });
      return NextResponse.json({
        ok: true,
        pesan:
          `Jadwal: ${list.length} baris — baru ${hasil.jadwal_baru}, ` +
          `diperbarui ${hasil.jadwal_diperbarui}, dihapus ${hasil.jadwal_dihapus}, ` +
          `poli baru ${hasil.poli_baru}, dokter baru ${hasil.dokter_baru}.`,
      });
    }

    if (jenis === "kasur") {
      const data = await simrsAmbil<{ per_ruang?: Record<string, unknown>[] }>("/bed-display");
      const ruang = Array.isArray(data.per_ruang) ? data.per_ruang : [];
      if (ruang.length === 0) throw new Error("SIMRS mengirim data tempat tidur kosong.");
      const unit: UnitMasuk[] = ruang.map((r, i) => {
        const kelas = String(r.kelas ?? "");
        return {
          nama_unit: String(r.namaruang ?? ""),
          kelas: KELAS[kelas.toUpperCase()] ?? kelas.slice(0, 40),
          total: Number(r.kapasitas ?? 0),
          terisi: Number(r.terisi ?? 0),
          keterangan: String(r.bangsal ?? ""),
          urutan: i + 1,
        };
      });
      await teruskan("/api/simrs/kasur", { unit });
      return NextResponse.json({
        ok: true,
        pesan:
          `Tempat tidur: ${unit.length} unit, ` +
          `${unit.reduce((n, u) => n + u.total, 0)} bed ` +
          `(${unit.reduce((n, u) => n + u.terisi, 0)} terisi).`,
      });
    }

    return NextResponse.json({ ok: false, pesan: "Jenis sinkronisasi tidak dikenal." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, pesan: e instanceof Error ? e.message : "Sinkronisasi gagal." },
      { status: 502 }
    );
  }
}
