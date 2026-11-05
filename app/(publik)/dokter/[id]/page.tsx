import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";
import { JsonLdDokter } from "@/components/json-ld";
import { getDokter, getJadwalDokter, gambar, jamRapi, pecahHari } from "@/lib/data";

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const dokter = await getDokter(decodeURIComponent(id));
  if (!dokter) return { title: "Dokter tidak ditemukan" };
  return {
    title: `${dokter.nama_dokter} — ${dokter.nama_poli ?? "Dokter"}`,
    description: `Profil dan jadwal praktik ${dokter.nama_dokter} di RSU Mahkota Bidadari.`,
  };
}

export default async function DokterDetail({ params }: { params: Params }) {
  const { id } = await params;
  const dokter = await getDokter(decodeURIComponent(id));
  if (!dokter) notFound();

  const jadwal = await getJadwalDokter(dokter.id_dokter);

  return (
    <>
      <JsonLdDokter
        nama={dokter.nama_dokter}
        poli={dokter.nama_poli}
        gambar={`https://rsub.rsumb.site${gambar(dokter.images)}`}
        url={`https://rsub.rsumb.site/dokter/${encodeURIComponent(dokter.id_dokter)}`}
      />
      <PageHeader
        eyebrow={dokter.nama_poli ?? "Dokter"}
        title={dokter.nama_dokter}
        crumbs={[
          { label: "Cari Dokter", href: "/dokter" },
          { label: dokter.nama_dokter },
        ]}
      />

      <section className="container-page py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-mist">
              <Image
                src={gambar(dokter.images)}
                alt={`Foto ${dokter.nama_dokter}`}
                fill
                sizes="280px"
                className="object-cover"
                priority
              />
            </div>
            <Link
              href={`/daftar-online?dokter=${encodeURIComponent(dokter.id_dokter)}`}
              className="mt-4 block rounded-lg bg-brand-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Buat Janji dengan Dokter Ini
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-900">Jadwal Praktik</h2>
            {jadwal.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Jadwal belum tercatat. Silakan hubungi pendaftaran di (061) 8830003.
              </p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-mist text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Hari</th>
                      <th className="px-4 py-3">Jam</th>
                      <th className="px-4 py-3">Poliklinik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwal.map((j) => (
                      <tr key={j.id_jadwal} className="border-t border-line">
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {pecahHari(j.hari).map((h) => (
                              <span key={h} className="rounded bg-mist px-2 py-0.5 text-xs font-medium">
                                {h}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-900">
                          {jamRapi(j.jammulai)} – {jamRapi(j.jamselesai)}
                        </td>
                        <td className="px-4 py-3 text-muted">{j.nama_poli}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {dokter.ket && (
              <>
                <h2 className="mt-8 text-lg font-semibold text-brand-900">Tentang Dokter</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {dokter.ket.replace(/<[^>]+>/g, "").trim()}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
