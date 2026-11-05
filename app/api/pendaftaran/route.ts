import { NextResponse } from "next/server";
import { pendaftaranSchema } from "@/lib/validasi";
import { getPoli, simpanPendaftaran } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Kirim notifikasi ke Telegram bila env tersedia (opsional). */
async function kirimTelegram(pesan: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: pesan,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      // jangan biarkan notifikasi menggagalkan pendaftaran
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, pesan: "Format permintaan tidak valid." }, { status: 400 });
  }

  const parsed = pendaftaranSchema.safeParse(payload);
  if (!parsed.success) {
    const pesan = parsed.error.issues[0]?.message ?? "Data belum lengkap.";
    return NextResponse.json({ ok: false, pesan }, { status: 422 });
  }

  const data = parsed.data;

  // tanggal kunjungan tidak boleh masa lalu
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  if (new Date(`${data.tanggal_kunjungan}T00:00:00`) < hariIni) {
    return NextResponse.json(
      { ok: false, pesan: "Tanggal kunjungan tidak boleh tanggal yang sudah lewat." },
      { status: 422 }
    );
  }

  const poli = await getPoli(data.id_poli);
  if (!poli) {
    return NextResponse.json({ ok: false, pesan: "Poliklinik tidak ditemukan." }, { status: 422 });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";

  try {
    const kode = await simpanPendaftaran(data, ip);

    const notif = [
      "<b>Pendaftaran online baru</b>",
      `Kode: <code>${kode}</code>`,
      `Nama: ${data.nama_pasien}`,
      `Telepon: ${data.telepon}`,
      `Poliklinik: ${poli.nama_poli}`,
      `Tanggal: ${data.tanggal_kunjungan}`,
      `Penjamin: ${data.penjamin}${data.no_penjamin ? ` (${data.no_penjamin})` : ""}`,
      data.keluhan ? `Keluhan: ${data.keluhan.slice(0, 200)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const terkirim = await kirimTelegram(notif);

    return NextResponse.json({ ok: true, kode, notif: terkirim });
  } catch (err) {
    console.error("Gagal menyimpan pendaftaran:", err);
    return NextResponse.json(
      { ok: false, pesan: "Pendaftaran gagal disimpan. Silakan coba lagi atau hubungi pendaftaran." },
      { status: 500 }
    );
  }
}
