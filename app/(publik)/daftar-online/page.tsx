import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";

export const metadata: Metadata = {
  title: "Pendaftaran via Mobile JKN",
  description:
    "Pendaftaran rawat jalan RSU Mahkota Bidadari dilakukan melalui aplikasi Mobile JKN BPJS Kesehatan. Unduh aplikasinya, pilih poliklinik dan dokter, lalu tunjukkan kode booking di loket.",
};

const PLAY = "https://play.google.com/store/apps/details?id=app.bpjs.mobile";
const APPLE = "https://apps.apple.com/id/app/mobile-jkn/id1237601115";

const langkah = [
  {
    judul: "Unduh aplikasi Mobile JKN",
    isi: "Pasang aplikasi resmi Mobile JKN dari Google Play atau App Store. Aplikasi ini gratis dan hanya tersedia dari toko aplikasi resmi.",
  },
  {
    judul: "Masuk dengan akun JKN",
    isi: "Gunakan NIK dan kata sandi akun JKN Anda. Bila belum punya akun, pilih menu daftar di aplikasi lalu ikuti verifikasi data kependudukan.",
  },
  {
    judul: "Pilih Pendaftaran Pelayanan",
    isi: "Di beranda aplikasi pilih Pendaftaran Pelayanan (Antrean Online), lalu cari RSU Mahkota Bidadari — Kabupaten Langkat.",
  },
  {
    judul: "Pilih poliklinik, dokter, dan tanggal",
    isi: "Tentukan poliklinik sesuai keluhan, pilih dokter yang praktik pada hari itu, lalu pilih tanggal kunjungan yang tersedia.",
  },
  {
    judul: "Simpan kode booking",
    isi: "Aplikasi menerbitkan nomor antrean dan kode booking. Datang 15 menit sebelum jadwal dan tunjukkan kode tersebut di loket pendaftaran.",
  },
];

export default async function DaftarOnlinePage() {
  const lang = await bacaBahasa();
  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pendaftaran")}
        title={tx(lang, "Pendaftaran via Mobile JKN")}
        description={tx(lang, "Pendaftaran rawat jalan di RSU Mahkota Bidadari dilakukan melalui aplikasi Mobile JKN milik BPJS Kesehatan. Situs ini tidak lagi menerima formulir pendaftaran sendiri.")}
        crumbs={[{ label: tx(lang, "Pendaftaran via Mobile JKN") }]}
      />

      <section className="container-page py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{tx(lang, "Unduh Mobile JKN")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tx(lang, "Hampir seluruh pasien kami adalah peserta JKN-KIS, sehingga pendaftaran berobat diarahkan ke aplikasi resmi BPJS Kesehatan agar nomor antrean langsung terbit dan tidak perlu mengisi ulang di loket.")}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a
                  href={PLAY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-800 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900"
                >{tx(lang, "Unduh di Google Play")}</a>
                <a
                  href={APPLE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-mist"
                >{tx(lang, "Unduh di App Store")}</a>
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{tx(lang, "Langkah pendaftaran")}</h2>
              <ol className="mt-3 space-y-3">
                {langkah.map((l, i) => (
                  <li key={tx(lang, l.judul)} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-900">{tx(lang, l.judul)}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{tx(lang, l.isi)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-semibold text-amber-800">{tx(lang, "Bukan peserta JKN atau butuh bantuan?")}</h2>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-amber-900/90">
                <li>{tx(lang, "• Pasien umum, asuransi swasta, atau perusahaan: hubungi pendaftaran untuk pendaftaran manual.")}</li>
                <li>{tx(lang, "• Jadwal praktik dokter bisa dicek di halaman Cari Dokter sebelum memilih tanggal di aplikasi.")}</li>
                <li>{tx(lang, "• Pasien JKN tetap membawa KTP dan kartu JKN (KIS) saat datang.")}</li>
              </ul>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{tx(lang, "Butuh bantuan?")}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">{tx(lang, "Petugas pendaftaran membantu pada jam kerja. Untuk kondisi darurat, langsung ke IGD 24 jam.")}</p>
              <a
                href="tel:(061)8830003"
                className="mt-3 block rounded-lg bg-brand-800 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-900"
              >
                (061) 8830003
              </a>
              <a
                href="https://wa.me/6281269378222"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold text-brand-900 hover:bg-white"
              >{tx(lang, "WhatsApp pendaftaran")}</a>
            </div>

            <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-5">
              <h2 className="text-sm font-semibold text-red-700">{tx(lang, "IGD 24 jam")}</h2>
              <p className="mt-1 text-xs leading-relaxed text-red-700/80">{tx(lang, "Kondisi darurat tidak perlu memakai antrean online — datang langsung atau telepon.")}</p>
              <a
                href="tel:085359267962"
                className="mt-3 block rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-red-700"
              >
                0853 5926 7962
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
