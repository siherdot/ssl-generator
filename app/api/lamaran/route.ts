import { NextResponse } from "next/server";
import { z } from "zod";
import { simpanLamaran } from "@/lib/data";
import { bolehKirim, ipKlien, kirimTelegram } from "@/lib/notif";
import { emailOpsional, honeypot, teleponWajib } from "@/lib/validasi";

export const dynamic = "force-dynamic";

const skema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  telepon: teleponWajib,
  email: emailOpsional,
  posisi: z.string().trim().min(2, "Tulis posisi yang dilamar").max(150),
  pesan: z.string().trim().max(1500).optional().default(""),
  situs: honeypot,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, pesan: "Format tidak valid." }, { status: 400 });
  }

  const hasil = skema.safeParse(body);
  if (!hasil.success) {
    return NextResponse.json(
      { ok: false, pesan: hasil.error.issues[0]?.message ?? "Data belum lengkap." },
      { status: 422 }
    );
  }

  const ip = ipKlien(request);
  if (!bolehKirim(`lamaran:${ip}`, 3)) {
    return NextResponse.json(
      { ok: false, pesan: "Terlalu banyak pengiriman dari jaringan ini. Coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const kode = await simpanLamaran(hasil.data, ip);
    await kirimTelegram(
      [
        "<b>Lamaran kerja baru</b>",
        `Kode: <code>${kode}</code>`,
        `Nama: ${hasil.data.nama}`,
        `Telepon: ${hasil.data.telepon}`,
        hasil.data.email ? `Email: ${hasil.data.email}` : "",
        `Posisi: ${hasil.data.posisi}`,
        hasil.data.pesan ? `\n${hasil.data.pesan.slice(0, 500)}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
    return NextResponse.json({ ok: true, kode });
  } catch (err) {
    console.error("Gagal simpan lamaran:", err);
    return NextResponse.json(
      { ok: false, pesan: "Lamaran gagal dikirim. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
