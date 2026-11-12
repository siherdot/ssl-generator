import type { Metadata } from "next";
import { site } from "@/lib/site";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Alur Pendaftaran Pasien") };
}

const langkah = [
  {
    judul: "Datang ke rumah sakit",
    isi: "Untuk kondisi darurat, langsung menuju IGD yang buka 24 jam. Untuk berobat terjadwal, peserta JKN mendaftar lebih dulu lewat aplikasi Mobile JKN, lalu datang ke bagian pendaftaran rawat jalan.",
  },
  {
    judul: "Daftar di loket",
    isi: "Tunjukkan identitas (KTP/kartu keluarga), kartu berobat bila sudah punya, serta kartu asuransi bila menggunakan penjamin.",
  },
  {
    judul: "Tentukan poliklinik dan dokter",
    isi: "Petugas mengarahkan ke poliklinik sesuai keluhan. Anda juga bisa memilih dokter lewat halaman Cari Dokter sebelum datang.",
  },
  {
    judul: "Tunggu panggilan",
    isi: "Nomor antrean dipanggil sesuai urutan. Waktu tunggu berbeda tiap poliklinik dan jam kedatangan.",
  },
  {
    judul: "Pemeriksaan dokter",
    isi: "Dokter melakukan pemeriksaan dan menentukan tindakan lanjutan: obat, pemeriksaan penunjang, atau rawat inap.",
  },
  {
    judul: "Farmasi dan pembayaran",
    isi: "Ambil obat di farmasi. Untuk pasien umum, pembayaran dilakukan di kasir; pasien penjamin mengikuti prosedur asuransi.",
  },
];

export default async function AlurPage() {
  const lang = await bacaBahasa();
  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Alur Pendaftaran Pasien")}
        description={tx(lang, "Gambaran umum langkah berobat di RSU Mahkota Bidadari. Petugas di loket akan membantu bila ada perbedaan prosedur.")}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: tx(lang, "Alur Pendaftaran") },
        ]}
      />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <ol className="space-y-3">
          {langkah.map((l, i) => (
            <li key={tx(lang, l.judul)} className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)]">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-brand-900">{tx(lang, l.judul)}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{tx(lang, l.isi)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-semibold text-red-700">{tx(lang, "Kondisi darurat")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-red-700/80">{tx(lang, "Jangan menunggu jadwal. Datang langsung ke IGD atau hubungi nomor IGD.")}</p>
            <a
              href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
              className="mt-3 block rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700"
            >
              {site.phone}
            </a>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
            <h2 className="text-sm font-semibold text-brand-900">{tx(lang, "Daftar dari rumah")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{tx(lang, "Daftar lewat aplikasi Mobile JKN agar nomor antrean langsung terbit.")}</p>
            <Link
              href="/daftar-online"
              className="mt-3 block rounded-lg bg-brand-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Daftar via Mobile JKN
            </Link>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-brand-900">{tx(lang, "Yang perlu dibawa")}</h2>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>{tx(lang, "• Identitas (KTP / kartu keluarga)")}</li>
              <li>{tx(lang, "• Kartu berobat (bila sudah punya)")}</li>
              <li>{tx(lang, "• Kartu asuransi / surat jaminan")}</li>
              <li>{tx(lang, "• Hasil pemeriksaan sebelumnya (bila ada)")}</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
