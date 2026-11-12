import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getKasur, waktuDb } from "@/lib/data";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Ketersediaan Tempat Tidur") };
}

export const dynamic = "force-dynamic";

function waktuRelatif(iso: string): { teks: string; basi: boolean } {
  const d = waktuDb(iso);
  if (!d) return { teks: "tidak diketahui", basi: true };

  const menit = Math.floor((Date.now() - d.getTime()) / 60000);
  // sinkron berjalan tiap jam; lewat 2,5 jam berarti ada yang salah
  const basi = menit > 150;

  if (menit < 1) return { teks: "baru saja", basi };
  if (menit < 60) return { teks: `${menit} menit lalu`, basi };
  const jam = Math.floor(menit / 60);
  if (jam < 24) return { teks: `${jam} jam lalu`, basi };
  return { teks: `${Math.floor(jam / 24)} hari lalu`, basi };
}

export default async function KetersediaanPage() {
  const lang = await bacaBahasa();
  const kasur = await getKasur();

  const total = kasur.reduce((n, k) => n + Number(k.total || 0), 0);
  const terisi = kasur.reduce((n, k) => n + Number(k.terisi || 0), 0);
  const kosong = Math.max(0, total - terisi);
  const persen = total > 0 ? Math.round((terisi / total) * 100) : 0;

  const terakhir = kasur.reduce<string | null>((max, k) => {
    if (!max) return k.diperbarui;
    return k.diperbarui > max ? k.diperbarui : max;
  }, null);
  const infoWaktu = terakhir ? waktuRelatif(terakhir) : null;

  // Rekap per kelas, urutan mengikuti papan display SIMRS.
  const URUTAN_KELAS = ["VIP", "I", "II", "III", "NICU", "PICU", "ICU", "HCU", "Isolasi"];
  const terjemahWaktu = (t: string) =>
    t === "baru saja" ? "just now" : t.replace(/^([0-9]+) jam lalu$/, "$1 hours ago").replace(/^([0-9]+) menit lalu$/, "$1 minutes ago").replace(/^([0-9]+) hari lalu$/, "$1 days ago");

  const labelKelas = (kelas: string) =>
    /^[IVX]+$/i.test(kelas) ? `${lang === "en" ? "Class" : "Kelas"} ${kelas.toUpperCase()}` : kelas;

  const rekap = new Map<string, { kapasitas: number; terisi: number }>();
  for (const k of kasur) {
    const kelas = (k.kelas || "Lainnya").trim() || "Lainnya";
    const isi = rekap.get(kelas) ?? { kapasitas: 0, terisi: 0 };
    isi.kapasitas += Number(k.total || 0);
    isi.terisi += Number(k.terisi || 0);
    rekap.set(kelas, isi);
  }

  const perKelas = [...rekap.entries()]
    .map(([kelas, isi]) => ({ kelas, ...isi, kosong: Math.max(0, isi.kapasitas - isi.terisi) }))
    .sort((a, b) => {
      const ia = URUTAN_KELAS.indexOf(a.kelas);
      const ib = URUTAN_KELAS.indexOf(b.kelas);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.kelas.localeCompare(b.kelas);
    });


  return (
    <>
      {/* halaman papan informasi: muat ulang tiap 5 menit, seperti display SIMRS */}
      <meta httpEquiv="refresh" content="300" />
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Ketersediaan Tempat Tidur")}
        description={tx(lang, "Ringkasan tempat tidur rawat inap per kelas. Angka diperbarui berkala dari sistem rumah sakit.")}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: tx(lang, "Ketersediaan Tempat Tidur") },
        ]}
      />

      <section className="container-page py-8">
        {kasur.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-brand/50 bg-brand/10 p-6">
            <h2 className="text-lg font-semibold text-brand-900">Data belum tersedia</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Angka ketersediaan tempat tidur belum masuk ke situs. Untuk memastikan kamar yang
              tersedia saat ini, silakan hubungi pendaftaran — jangan berangkat sebelum
              dikonfirmasi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Telepon {site.phone}
              </a>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-brand-900/20 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                WhatsApp {site.whatsappLabel}
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* ringkasan */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs uppercase tracking-wide text-muted">{tx(lang, "Total tempat tidur")}</p>
                <p className="mt-1 text-3xl font-bold text-brand-900">{total}</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs uppercase tracking-wide text-muted">{tx(lang, "Terisi")}</p>
                <p className="mt-1 text-3xl font-bold text-ink">{terisi}</p>
                <p className="mt-1 text-xs text-muted">{lang === "en" ? `${persen}% of total` : `${persen}% dari total`}</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-brand/50 bg-brand/10 p-5">
                <p className="text-xs uppercase tracking-wide text-brand-900">{tx(lang, "Kosong")}</p>
                <p className="mt-1 text-3xl font-bold text-brand-900">{kosong}</p>
                <p className="mt-1 text-xs text-brand-900/70">siap dipakai</p>
              </div>
            </div>

            {infoWaktu && (
              <p
                className={`mt-4 rounded-lg px-4 py-2 text-sm ${
                  infoWaktu.basi
                    ? "bg-sun/25 text-brand-900"
                    : "bg-mist text-muted"
                }`}
              >
                {lang === "en" ? `Updated ${terjemahWaktu(infoWaktu.teks)}.` : `Data diperbarui ${infoWaktu.teks}.`}
                {infoWaktu.basi && (lang === "en" ? " Figures may have changed — please confirm with our registration desk." : " Angka mungkin sudah berubah — konfirmasi ke pendaftaran.")}
              </p>
            )}

            {/* rekap per kelas — susunannya mengikuti papan display SIMRS */}
            <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
              <table className="w-full">
                <thead className="bg-mist text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">{lang === "en" ? "Room name" : "Nama kamar"}</th>
                    <th className="px-4 py-3 text-center">Kapasitas</th>
                    <th className="px-4 py-3 text-center">{tx(lang, "Terisi")}</th>
                    <th className="px-4 py-3 text-center">{tx(lang, "Kosong")}</th>
                  </tr>
                </thead>
                <tbody className="text-2xl font-bold tabular-nums text-ink">
                  {perKelas.map((k) => (
                    <tr key={k.kelas} className="border-t border-line">
                      <td className="px-4 py-3 text-lg font-semibold">{labelKelas(k.kelas)}</td>
                      <td className="px-4 py-3 text-center">{k.kapasitas}</td>
                      <td className="px-4 py-3 text-center">{k.terisi}</td>
                      <td
                        className={`px-4 py-3 text-center ${
                          k.kosong === 0 ? "text-red-600" : "text-brand-800"
                        }`}
                      >
                        {k.kosong}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-brand-800 bg-brand/10">
                    <td className="px-4 py-3 text-lg font-bold text-brand-900">TOTAL</td>
                    <td className="px-4 py-3 text-center font-bold">{total}</td>
                    <td className="px-4 py-3 text-center font-bold">{terisi}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand-900">{kosong}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">{tx(lang, "Angka bersifat informasi umum dan dapat berubah sewaktu-waktu. Ketersediaan kamar untuk pasien baru tetap ditentukan oleh petugas pendaftaran. Untuk kondisi darurat, langsung menuju IGD 24 jam.")}</p>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/daftar-online"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Daftar via Mobile JKN
          </Link>
          <Link
            href="/kontak"
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
          >
            {lang === "en" ? "Contact us" : "Hubungi kami"}
          </Link>
        </div>
      </section>
    </>
  );
}
