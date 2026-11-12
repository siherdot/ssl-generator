import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getCompany, getPenjamin } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pertanyaan Umum (FAQ)",
  description:
    "Pertanyaan yang sering diajukan pasien RSU Mahkota Bidadari: jam IGD, pendaftaran, dokter, penjamin, dan rawat inap.",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const lang = await bacaBahasa();
  const [company, penjamin] = await Promise.all([getCompany(), getPenjamin()]);

  const faq = [
    {
      q: "Apakah IGD buka 24 jam?",
      a: "Ya. Instalasi Gawat Darurat RSU Mahkota Bidadari melayani 24 jam setiap hari. Untuk kondisi darurat, datang langsung ke IGD.",
    },
    {
      q: "Bagaimana cara mendaftar berobat?",
      a: "Dua cara: datang langsung ke loket pendaftaran, atau isi formulir pendaftaran online di situs ini lalu tunjukkan kode pendaftaran di loket.",
    },
    {
      q: "Bagaimana cara mengetahui jadwal dokter?",
      a: "Buka halaman Cari Dokter. Anda bisa memfilter berdasarkan poliklinik, hari praktik, atau mengetik nama dokter. Setiap dokter punya halaman profil dengan jadwal lengkap.",
    },
    {
      q: "Apakah menerima asuransi?",
      a: `Kami bekerja sama dengan ${penjamin.length} rekanan asuransi, TPA, dan korporat. Daftarnya ada di halaman Asuransi & Penjamin. Sebaiknya konfirmasi ke kantor penjamin sebelum datang.`,
    },
    {
      q: "Kelas rawat inap apa saja yang tersedia?",
      a: "Kelas III, II, I, dan VIP, serta perawatan intensif ICU, NICU & Baby. Ketersediaan kamar berubah setiap hari — konfirmasi ke pendaftaran.",
    },
    {
      q: "Di mana alamat rumah sakit?",
      a: `${company?.alamat ?? "Jl. Sisingamangaraja No. 146, Desa Paluh Manis, Kec. Gebang, Kabupaten Langkat"}.`,
    },
    {
      q: "Nomor apa yang bisa dihubungi?",
      a: `Telepon ${company?.phone ?? "(061) 8830003"} atau WhatsApp 0812 6932 8888. Untuk darurat gunakan nomor IGD ${company?.igd_phone ?? "(061) 8830003"}.`,
    },
    {
      q: "Apakah bisa memilih dokter saat mendaftar online?",
      a: "Bisa. Pilih poliklinik lebih dulu, lalu pilih dokter yang praktik di poliklinik tersebut. Dokter juga bisa ditentukan nanti di loket.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Pertanyaan Umum")}
        description={tx(lang, "Jawaban singkat untuk pertanyaan yang paling sering ditanyakan pasien dan keluarga.")}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: "FAQ" },
        ]}
      />

      <section className="container-page py-8">
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)] open:border-brand/60"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-brand-900">
                {f.q}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 text-brand-700 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-[var(--radius-card)] border border-dashed border-brand/50 bg-brand/10 p-5 text-sm">
          <p className="font-semibold text-brand-900">Pertanyaan belum terjawab?</p>
          <p className="mt-1 text-muted">{tx(lang, "Kirim lewat formulir kontak atau hubungi kami langsung.")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/kontak" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
              Formulir kontak
            </Link>
            <a
              href="https://wa.me/6281269328888"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-brand-900/20 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-mist"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
