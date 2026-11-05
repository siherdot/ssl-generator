import { NextResponse } from "next/server";
import { z } from "zod";
import { simpanSurvei } from "@/lib/data";
import { bolehKirim, ipKlien, kirimTelegram } from "@/lib/notif";
import { honeypot } from "@/lib/validasi";

export const dynamic = "force-dynamic";

const bintang = z.coerce
  .number()
  .int()
  .min(1, "Pilih nilai 1–5 bintang")
  .max(5, "Pilih nilai 1–5 bintang");

const skema = z.object({
  nama: z.string().trim().max(120).optional().default(""),
  unit: z.string().trim().min(1, "Pilih unit layanan").max(120),
  r_pendaftaran: bintang,
  r_dokter: bintang,
  r_perawat: bintang,
  r_fasilitas: bintang,
  r_kebersihan: bintang,
  komentar: z.string().trim().max(2000).optional().default(""),
  saran: z.string().trim().max(2000).optional().default(""),
  situs: honeypot,
});

const BINTANG = ["", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"];

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
  if (!bolehKirim(`survei:${ip}`, 5)) {
    return NextResponse.json(
      { ok: false, pesan: "Terlalu banyak pengiriman dari jaringan ini. Coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const d = hasil.data;
    const nilai = await simpanSurvei(d, ip);

    await kirimTelegram(
      [
        "<b>Survei kepuasan baru</b>",
        `Nilai rata-rata: <b>${nilai.toFixed(2)}/5</b>`,
        d.unit ? `Unit: ${d.unit}` : "",
        d.nama ? `Nama: ${d.nama}` : "Nama: (tidak diisi)",
        `Pendaftaran ${BINTANG[d.r_pendaftaran]} · Dokter ${BINTANG[d.r_dokter]}`,
        `Perawat ${BINTANG[d.r_perawat]} · Fasilitas ${BINTANG[d.r_fasilitas]}`,
        `Kebersihan ${BINTANG[d.r_kebersihan]}`,
        d.komentar ? `Komentar: ${d.komentar.slice(0, 400)}` : "",
        d.saran ? `Saran: ${d.saran.slice(0, 400)}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );

    return NextResponse.json({ ok: true, nilai: Number(nilai.toFixed(2)) });
  } catch (err) {
    console.error("Gagal simpan survei:", err);
    return NextResponse.json(
      { ok: false, pesan: "Maaf, survei gagal disimpan. Coba lagi." },
      { status: 500 }
    );
  }
}
