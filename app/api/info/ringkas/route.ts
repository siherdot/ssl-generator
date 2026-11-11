import { NextResponse } from "next/server";
import { getDokterList, getKasur, getPoliRingkas, getKasurDiperbarui } from "@/lib/data";

/**
 * Ringkasan data situs untuk asisten AI (n8n).
 * GET /api/info/ringkas
 *
 * Hanya data publik: dokter + jadwal praktik, daftar poliklinik, dan angka
 * agregat tempat tidur. Tidak ada identitas pasien. Tanpa token karena isinya
 * sama dengan yang sudah tampil di halaman publik.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const [dokter, poli, kasur, terakhir] = await Promise.all([
    getDokterList(),
    getPoliRingkas(),
    getKasur(),
    getKasurDiperbarui(),
  ]);

  const total = kasur.reduce((n, k) => n + Number(k.total || 0), 0);
  const terisi = kasur.reduce((n, k) => n + Number(k.terisi || 0), 0);

  const perKelas = new Map<string, { kapasitas: number; terisi: number }>();
  for (const k of kasur) {
    const kelas = String(k.kelas || "Lainnya").trim() || "Lainnya";
    const isi = perKelas.get(kelas) ?? { kapasitas: 0, terisi: 0 };
    isi.kapasitas += Number(k.total || 0);
    isi.terisi += Number(k.terisi || 0);
    perKelas.set(kelas, isi);
  }

  return NextResponse.json({
    poli: poli.map((p) => p.nama_poli),
    dokter: dokter.map((d) => ({
      nama: d.nama_dokter,
      poli: d.nama_poli ?? null,
      jadwal: (d.jadwal ?? []).map((j) => ({ hari: j.hari, jam: j.jam })),
    })),
    tempat_tidur: {
      total,
      terisi,
      kosong: Math.max(0, total - terisi),
      per_kelas: [...perKelas.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([kelas, v]) => ({ kelas, ...v, kosong: Math.max(0, v.kapasitas - v.terisi) })),
      diperbarui: terakhir?.diperbarui ?? null,
    },
  });
}
