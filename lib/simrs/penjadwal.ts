import "server-only";
import { simrsAmbil } from "./klien";
import { unitDariBedDisplay } from "./bed";
import { kirimTelegram } from "@/lib/notif";

/**
 * Sinkronisasi ketersediaan tempat tidur dari dalam container: sekali saat
 * server hidup, lalu tiap jam. Menggantikan cron di host.
 */
const JEDA_MS = 60 * 60 * 1000;
/** Kirim peringatan setelah sekian kali gagal berturut-turut (biar tidak spam saat jaringan kedip). */
const BATAS_GAGAL = 2;

const g = globalThis as { __simrsGagal?: number; __simrsSudahLapor?: boolean };

async function sinkronSekali() {
  const token = process.env.SIMRS_API_TOKEN;
  if (!token) {
    console.warn("[simrs] SIMRS_API_TOKEN kosong — sinkron tempat tidur dilewati.");
    return;
  }

  try {
    const data = await simrsAmbil<{ per_ruang?: Record<string, unknown>[] }>("/bed-display");
    const unit = unitDariBedDisplay(data);
    if (unit.length === 0) throw new Error("SIMRS mengirim data tempat tidur kosong.");

    // teruskan ke endpoint ingest yang sama dengan yang dipakai tombol admin
    const { POST } = await import("@/app/api/simrs/kasur/route");
    const res = await POST(
      new Request("http://internal/api/simrs/kasur", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ unit }),
      })
    );
    const hasil = (await res.json()) as { pesan?: string };
    if (!res.ok) throw new Error(hasil.pesan ?? `ingest HTTP ${res.status}`);

    console.log(
      `[simrs] tempat tidur tersinkron: ${unit.length} unit, ` +
        `${unit.reduce((n, u) => n + u.total, 0)} bed ` +
        `(${unit.reduce((n, u) => n + u.terisi, 0)} terisi).`
    );
    g.__simrsGagal = 0;
    g.__simrsSudahLapor = false;
  } catch (e) {
    const pesan = e instanceof Error ? e.message : String(e);
    console.warn("[simrs] sinkron tempat tidur gagal:", pesan);

    g.__simrsGagal = (g.__simrsGagal ?? 0) + 1;
    if (g.__simrsGagal >= BATAS_GAGAL && !g.__simrsSudahLapor) {
      g.__simrsSudahLapor = true;
      void kirimTelegram(
        `⚠️ Sinkron tempat tidur SIMRS gagal ${g.__simrsGagal}× berturut-turut.\n` +
          `Pesan: ${pesan}\n` +
          `Angka kamar di situs bisa jadi tidak terbaru. Periksa Dashboard → Pengaturan → Koneksi SIMRS.`
      );
    }
  }
}

export function mulaiSinkronTempatTidur() {
  if (process.env.SIMRS_AUTO_SINKRON === "0") {
    console.log("[simrs] sinkron otomatis dimatikan (SIMRS_AUTO_SINKRON=0).");
    return;
  }

  // satu timer per proses, walau register() terpanggil lagi (hot reload / dev)
  const g = globalThis as { __simrsTimerTidur?: ReturnType<typeof setInterval> };
  if (g.__simrsTimerTidur) return;

  void sinkronSekali();
  const timer = setInterval(() => void sinkronSekali(), JEDA_MS);
  timer.unref?.();
  g.__simrsTimerTidur = timer;
  console.log("[simrs] penjadwal tempat tidur aktif — tiap 60 menit.");
}
