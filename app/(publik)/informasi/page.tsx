import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getNewsList, getPenjamin, tanggalRapi } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pusat Informasi",
  description:
    "Informasi pasien RSU Mahkota Bidadari: berita, penjamin, alur pendaftaran, karier, dan pertanyaan umum.",
};

export const dynamic = "force-dynamic";

export default async function InformasiPage() {
  const lang = await bacaBahasa();
  const [berita, penjamin] = await Promise.all([getNewsList(3), getPenjamin()]);

  const kelompok = [
    {
      nama: "Untuk Pasien",
      ket: "Panduan berobat, kamar, dan penjamin biaya.",
      kartu: [
        {
          href: "/informasi/ketersediaan-kamar",
          title: "Ketersediaan Tempat Tidur",
          desc: "Cek kamar rawat inap yang masih kosong.",
        },
        {
          href: "/informasi/alur-pendaftaran",
          title: "Alur Pendaftaran",
          desc: "Langkah berobat dari datang sampai pulang.",
        },
        {
          href: "/informasi/asuransi",
          title: "Asuransi & Penjamin",
          desc: `${penjamin.length} rekanan asuransi, TPA, dan korporat.`,
        },
        {
          href: "/informasi/faq",
          title: "Pertanyaan Umum",
          desc: "Jawaban singkat untuk pertanyaan yang sering muncul.",
        },
        {
          href: "/dokter",
          title: "Jadwal Dokter",
          desc: "Praktik dokter spesialis per poliklinik dan hari.",
        },
      ],
    },
    {
      nama: "Untuk Profesional",
      ket: "Peluang karier, jadwal dokter, dan layanan korporat.",
      kartu: [
        {
          href: "/informasi/karier",
          title: "Karier",
          desc: "Peluang bergabung sebagai tenaga medis atau non-medis.",
        },
      ],
    },
    {
      nama: "Untuk Umum",
      ket: "Kabar rumah sakit, profil, dan kontak.",
      kartu: [
        { href: "/informasi/berita", title: "Berita & Kegiatan", desc: "Kabar terbaru rumah sakit." },
        { href: "/tentang", title: "Tentang Kami", desc: "Sejarah, visi, misi, dan struktur layanan." },
        {
          href: "/rumah-sakit-kami",
          title: "Rumah Sakit Kami",
          desc: "Jaringan Bidadari Group di Sumatera Utara dan Aceh.",
        },
        { href: "/kontak", title: "Kontak", desc: "Alamat, telepon, WhatsApp, dan formulir pesan." },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Pusat Informasi")}
        description={tx(lang, "Informasi dikelompokkan sesuai kebutuhan Anda — pasien, tenaga profesional, dan masyarakat umum.")}
        crumbs={[{ label: tx(lang, "Pusat Informasi") }]}
      />

      <section className="container-page py-8">
        <div className="space-y-10">
          {kelompok.map((g) => (
            <div key={g.nama}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-800">
                  {g.nama}
                </h2>
                <p className="text-xs text-muted">{g.ket}</p>
              </div>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {g.kartu.map((k) => (
                  <li key={k.href}>
                    <Link
                      href={k.href}
                      className="card-hover flex h-full flex-col justify-between rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-brand-900">{k.title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted">{k.desc}</span>
                      </span>
                      <span className="mt-4 text-xs font-semibold text-brand-800">Buka →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="section-title mt-12 text-xl">Berita terbaru</h2>
        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
          {berita.map((n) => (
            <li key={n.news_id}>
              <Link
                href={`/informasi/berita/${encodeURIComponent(n.news_id)}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-mist"
              >
                <span className="text-sm font-medium text-ink">{n.title}</span>
                <span className="shrink-0 text-xs text-muted">{tanggalRapi(n.create_date) ?? ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
