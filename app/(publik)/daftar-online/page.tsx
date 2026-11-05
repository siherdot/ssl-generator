import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import DaftarOnlineForm from "@/components/daftar-online-form";
import { getDokterList, getPenjamin, getPoliList } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pendaftaran Online",
  description:
    "Daftar rawat jalan RSU Mahkota Bidadari secara online: pilih poliklinik, dokter, dan tanggal kunjungan.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ dokter?: string }>;

export default async function DaftarOnlinePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [poliList, dokterList, penjaminList] = await Promise.all([
    getPoliList(),
    getDokterList(),
    getPenjamin(),
  ]);

  const dokterAwal = sp.dokter && dokterList.some((d) => d.id_dokter === sp.dokter) ? sp.dokter : "";

  return (
    <>
      <PageHeader
        eyebrow="Pendaftaran"
        title="Pendaftaran Online"
        description="Isi data di bawah untuk mengambil nomor pendaftaran rawat jalan. Setelah terkirim, tunjukkan kode pendaftaran di loket."
        crumbs={[{ label: "Pendaftaran Online" }]}
      />

      <section className="container-page py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <DaftarOnlineForm
            poliList={poliList.map((p) => ({ id_poli: p.id_poli, nama_poli: p.nama_poli }))}
            dokterList={dokterList.map((d) => ({
              id_dokter: d.id_dokter,
              nama_dokter: d.nama_dokter,
              id_poli: d.id_poli,
            }))}
            penjaminList={penjaminList.map((p) => ({ id: p.id, nama: p.nama, kategori: p.kategori }))}
            dokterAwal={dokterAwal}
          />

          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">Alur pendaftaran</h2>
              <ol className="mt-3 space-y-2 text-sm text-ink">
                {[
                  "Isi formulir dan kirim",
                  "Catat kode pendaftaran",
                  "Datang 15 menit sebelum jadwal",
                  "Tunjukkan kode di loket",
                ].map((t, i) => (
                  <li key={t} className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">Butuh bantuan?</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Pendaftaran dibantu petugas pada jam kerja. Untuk kondisi darurat, langsung ke IGD 24 jam.
              </p>
              <a
                href="tel:(061)8830003"
                className="mt-3 block rounded-lg bg-brand-800 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
              >
                (061) 8830003
              </a>
              <a
                href="https://wa.me/6281269328888"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold text-brand-900 hover:bg-mist"
              >
                WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
