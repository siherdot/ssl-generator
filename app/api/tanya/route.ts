import { NextResponse } from "next/server";

/**
 * Penghubung obrolan beranda ke n8n.
 * Body masuk : { pesan, sesi }
 * Body keluar: { jawaban }
 *
 * Alamat webhook disimpan di env N8N_CHAT_WEBHOOK (bisa diubah dari dashboard
 * Coolify tanpa deploy ulang). Format kiriman mengikuti Chat Trigger n8n:
 * { action: "sendMessage", sessionId, chatInput }.
 */
const BATAS_PER_MENIT = 12;
const jatah = new Map<string, { n: number; sampai: number }>();

function bolehJalan(ip: string) {
  const kini = Date.now();
  const catat = jatah.get(ip);
  if (!catat || catat.sampai < kini) {
    jatah.set(ip, { n: 1, sampai: kini + 60_000 });
    return true;
  }
  if (catat.n >= BATAS_PER_MENIT) return false;
  catat.n += 1;
  return true;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
  if (!bolehJalan(ip)) {
    return NextResponse.json({ jawaban: "Terlalu banyak pertanyaan. Tunggu satu menit lagi, ya." }, { status: 429 });
  }

  const alamat = process.env.N8N_CHAT_WEBHOOK;
  if (!alamat) {
    return NextResponse.json(
      { jawaban: "Layanan tanya jawab belum tersambung. Silakan hubungi kami lewat telepon atau WhatsApp." },
      { status: 503 }
    );
  }

  const isi = (await req.json().catch(() => null)) as { pesan?: unknown; sesi?: unknown } | null;
  const pesan = typeof isi?.pesan === "string" ? isi.pesan.trim() : "";
  const sesi = typeof isi?.sesi === "string" && isi.sesi.length <= 64 ? isi.sesi : "tamu";
  if (!pesan || pesan.length > 1000) {
    return NextResponse.json({ jawaban: "Pertanyaan kosong atau terlalu panjang (maksimal 1000 huruf)." }, { status: 400 });
  }

  try {
    const r = await fetch(alamat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendMessage", sessionId: sesi, chatInput: pesan }),
      signal: AbortSignal.timeout(45_000),
    });

    const teks = await r.text();
    if (!r.ok) {
      console.error("[tanya] n8n membalas", r.status, teks.slice(0, 300));
      return NextResponse.json({ jawaban: "Asisten sedang sibuk. Coba lagi beberapa saat." }, { status: 502 });
    }

    let jawaban = "";
    try {
      const j: unknown = JSON.parse(teks);
      const satu = Array.isArray(j) ? j[0] : j;
      const isi2 = satu as Record<string, unknown> | undefined;
      jawaban = String(isi2?.output ?? isi2?.jawaban ?? isi2?.text ?? "").trim();
    } catch {
      jawaban = teks.trim();
    }

    return NextResponse.json({
      jawaban: jawaban || "Maaf, jawaban belum tersedia. Coba tanyakan dengan kalimat lain.",
    });
  } catch (e) {
    console.error("[tanya] gagal hubungi n8n:", (e as Error).message);
    return NextResponse.json({ jawaban: "Asisten tidak merespons. Coba lagi sebentar." }, { status: 504 });
  }
}
