import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Medical Check Up") };
}

const alur = [
  "Hubungi pendaftaran untuk memilih paket dan menjadwalkan kedatangan.",
  "Datang dalam keadaan puasa bila diminta petugas (biasanya 8–10 jam).",
  "Bawa identitas dan kartu penjamin bila menggunakan asuransi.",
  "Pemeriksaan dilakukan berurutan sesuai panduan petugas.",
  "Hasil pemeriksaan diserahkan sesuai jadwal yang diinformasikan.",
];

export default async function McuPage() {
  const lang = await bacaBahasa();
  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Fasilitas & Layanan")}
        title={tx(lang, "Medical Check Up")}
        description={tx(lang, "Pemeriksaan kesehatan berkala untuk deteksi dini, kebutuhan kerja, dan perusahaan.")}
        crumbs={[
          { label: tx(lang, "Fasilitas & Layanan"), href: "/layanan" },
          { label: tx(lang, "Medical Check Up") },
        ]}
      />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">{tx(lang, "Alur pemeriksaan")}</h2>
          <ol className="mt-3 space-y-3">
            {alur.map((a, i) => (
              <li key={tx(lang, a)} className="flex gap-3 rounded-lg border border-line bg-white p-3 text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {tx(lang, a)}
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-brand/50 bg-brand/10 p-5 text-sm text-ink">
            <p className="font-semibold text-brand-900">{tx(lang, "Daftar paket dan harga")}</p>
            <p className="mt-1 text-muted">{tx(lang, "Paket dan tarif MCU belum ditampilkan di situs ini. Silakan hubungi pendaftaran untuk daftar paket terbaru, atau kirim pertanyaan lewat formulir kontak.")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="tel:(061)8830003"
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                (061) 8830003
              </a>
              <Link
                href="/kontak"
                className="rounded-lg border border-brand-900/20 bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                {tx(lang, "Formulir kontak")}
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
            <h2 className="text-sm font-semibold text-brand-900">{tx(lang, "Untuk perusahaan")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{tx(lang, "Pemeriksaan kesehatan karyawan dapat dijadwalkan kolektif. Sertakan jumlah peserta dan jenis pemeriksaan yang dibutuhkan saat menghubungi kami.")}</p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-brand-900">Penjamin</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {tx(lang, "Sebagian paket dapat ditanggung asuransi rekanan. Cek daftarnya di halaman penjamin.")}
            </p>
            <Link
              href="/informasi/asuransi"
              className="mt-3 block rounded-lg bg-brand-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              {tx(lang, "Lihat penjamin")}
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
