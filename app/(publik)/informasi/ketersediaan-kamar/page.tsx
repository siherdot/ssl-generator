import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getKasur } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ketersediaan Tempat Tidur",
  description:
    "Pantau ketersediaan tempat tidur rawat inap RSU Mahkota Bidadari per kelas: total, terisi, dan kosong.",
};

export const dynamic = "force-dynamic";

function waktuRelatif(iso: string): { teks: string; basi: boolean } {
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return { teks: "tidak diketahui", basi: true };

  const menit = Math.floor((Date.now() - d.getTime()) / 60000);
  const basi = menit > 360; // lebih dari 6 jam dianggap perlu konfirmasi

  if (menit < 1) return { teks: "baru saja", basi };
  if (menit < 60) return { teks: `${menit} menit lalu`, basi };
  const jam = Math.floor(menit / 60);
  if (jam < 24) return { teks: `${jam} jam lalu`, basi };
  return { teks: `${Math.floor(jam / 24)} hari lalu`, basi };
}

export default async function KetersediaanPage() {
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

  return (
    <>
      <PageHeader
        eyebrow="Pusat Informasi"
        title="Ketersediaan Tempat Tidur"
        description="Ringkasan tempat tidur rawat inap per kelas. Angka diperbarui berkala dari sistem rumah sakit."
        crumbs={[
          { label: "Pusat Informasi", href: "/informasi" },
          { label: "Ketersediaan Tempat Tidur" },
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
                <p className="text-xs uppercase tracking-wide text-muted">Total tempat tidur</p>
                <p className="mt-1 text-3xl font-bold text-brand-900">{total}</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs uppercase tracking-wide text-muted">Terisi</p>
                <p className="mt-1 text-3xl font-bold text-ink">{terisi}</p>
                <p className="mt-1 text-xs text-muted">{persen}% dari total</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-brand/50 bg-brand/10 p-5">
                <p className="text-xs uppercase tracking-wide text-brand-900">Kosong</p>
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
                Data diperbarui {infoWaktu.teks}.
                {infoWaktu.basi && " Angka mungkin sudah berubah — konfirmasi ke pendaftaran."}
              </p>
            )}

            {/* rincian per unit */}
            <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Unit / kelas</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Terisi</th>
                    <th className="px-4 py-3 text-center">Kosong</th>
                    <th className="px-4 py-3">Okupansi</th>
                  </tr>
                </thead>
                <tbody>
                  {kasur.map((k) => {
                    const t = Number(k.total || 0);
                    const i = Number(k.terisi || 0);
                    const sisa = Math.max(0, t - i);
                    const p = t > 0 ? Math.round((i / t) * 100) : 0;
                    const penuh = t > 0 && sisa === 0;

                    return (
                      <tr key={k.id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <span className="block font-medium text-ink">{k.nama_unit}</span>
                          {(k.kelas || k.keterangan) && (
                            <span className="block text-[11px] text-muted">
                              {[k.kelas, k.keterangan].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{t}</td>
                        <td className="px-4 py-3 text-center">{i}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              penuh ? "bg-red-100 text-red-700" : "bg-brand/20 text-brand-900"
                            }`}
                          >
                            {sisa}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
                            <div
                              className={`h-full ${penuh ? "bg-red-500" : "bg-brand-700"}`}
                              style={{ width: `${p}%` }}
                            />
                          </div>
                          <span className="mt-1 block text-[11px] text-muted">{p}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Angka bersifat informasi umum dan dapat berubah sewaktu-waktu. Ketersediaan kamar
              untuk pasien baru tetap ditentukan oleh petugas pendaftaran. Untuk kondisi darurat,
              langsung menuju IGD 24 jam.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/daftar-online"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Pendaftaran online
          </Link>
          <Link
            href="/kontak"
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-mist"
          >
            Hubungi kami
          </Link>
        </div>
      </section>
    </>
  );
}
