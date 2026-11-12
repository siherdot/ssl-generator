import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getKasur, getKasurDiperbarui } from "@/lib/data";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Rawat Inap") };
}

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`.
export const dynamic = "force-dynamic";

function tanggal(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RawatInapPage() {
  const lang = await bacaBahasa();
  const [unit, terakhir] = await Promise.all([getKasur(), getKasurDiperbarui()]);
  const diperbarui = tanggal(terakhir?.diperbarui ?? null);
  const telepon = site.phone.replace(/[^0-9+]/g, "");

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Fasilitas & Layanan")}
        title={tx(lang, "Rawat Inap")}
        description={tx(lang, "Pelayanan rawat inap RSU Mahkota Bidadari dengan pilihan kelas perawatan, didampingi dokter dan perawat selama menjalani perawatan.")}
        crumbs={[
          { label: tx(lang, "Fasilitas & Layanan"), href: "/layanan" },
          { label: tx(lang, "Rawat Inap") },
        ]}
      />

      <section className="container-page py-8">
        {unit.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold text-brand-900">Informasi rawat inap</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pasien dirawat inap setelah menjalani pemeriksaan di IGD atau poliklinik dan
              mendapatkan surat masuk rawat inap dari dokter yang merawat. Rincian kelas
              perawatan dan jumlah tempat tidur per unit belum dipublikasikan di situs ini.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-ink sm:grid-cols-2">
              <li className="rounded-lg bg-mist px-3 py-2">Masuk melalui IGD atau poliklinik</li>
              <li className="rounded-lg bg-mist px-3 py-2">{tx(lang, "Kelas perawatan sesuai kebutuhan medis")}</li>
              <li className="rounded-lg bg-mist px-3 py-2">Penjamin asuransi dan perusahaan rekanan</li>
              <li className="rounded-lg bg-mist px-3 py-2">Dokter dan perawat jaga 24 jam</li>
            </ul>
            <p className="mt-4 text-xs text-muted">
              Ketersediaan kamar berubah setiap hari. Pastikan dengan pendaftaran sebelum berangkat.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`tel:${telepon}`}
                className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                {tx(lang, "Hubungi pendaftaran")}
              </a>
              <Link
                href="/informasi/ketersediaan-kamar"
                className="rounded-lg border border-brand-900/20 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                {tx(lang, "Cek ketersediaan kamar")}
              </Link>
              <Link
                href="/daftar-online"
                className="rounded-lg border border-brand-900/20 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                Daftar via Mobile JKN
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold text-brand-900">{tx(lang, "Kelas perawatan")}</h2>
              {diperbarui && <p className="text-xs text-muted">{tx(lang, "Diperbarui")} {diperbarui}</p>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Unit</th>
                    <th className="px-5 py-3 font-semibold">{tx(lang, "Kelas")}</th>
                    <th className="px-5 py-3 font-semibold">{tx(lang, "Tempat tidur")}</th>
                    <th className="px-5 py-3 font-semibold">{tx(lang, "Terisi")}</th>
                    <th className="px-5 py-3 font-semibold">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.map((u) => (
                    <tr key={u.id} className="border-t border-line">
                      <td className="px-5 py-3 font-medium text-brand-900">{lang === "en" && u.nama_unit.toLowerCase().startsWith("ruang ") ? "Room " + u.nama_unit.slice(6) : u.nama_unit}</td>
                      <td className="px-5 py-3 text-muted">{u.kelas ?? "—"}</td>
                      <td className="px-5 py-3 text-muted">{u.total}</td>
                      <td className="px-5 py-3 text-muted">{u.terisi}</td>
                      <td className="px-5 py-3 text-muted">{u.keterangan ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-line px-5 py-4">
              <a
                href={`tel:${telepon}`}
                className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                {tx(lang, "Hubungi pendaftaran")}
              </a>
              <Link
                href="/informasi/ketersediaan-kamar"
                className="rounded-lg border border-brand-900/20 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                {tx(lang, "Cek ketersediaan kamar")}
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
