/**
 * Notifikasi Telegram opsional.
 * Aktif hanya bila TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID diisi di environment.
 * Kegagalan notifikasi TIDAK boleh menggagalkan penyimpanan data.
 */
export async function kirimTelegram(pesan: string): Promise<boolean> {
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
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Ambil IP klien di belakang Cloudflare. */
export function ipKlien(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    ""
  );
}

/**
 * Pembatas laju sederhana (in-memory).
 * Cukup untuk mencegah spam form dari satu IP; reset saat container restart.
 */
const catatan = new Map<string, number[]>();

export function bolehKirim(ip: string, maks = 5, jendelaMs = 60 * 60 * 1000): boolean {
  if (!ip) return true;
  const sekarang = Date.now();
  const daftar = (catatan.get(ip) ?? []).filter((t) => sekarang - t < jendelaMs);
  if (daftar.length >= maks) {
    catatan.set(ip, daftar);
    return false;
  }
  daftar.push(sekarang);
  catatan.set(ip, daftar);
  return true;
}
