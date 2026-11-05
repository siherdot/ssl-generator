import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getPoliList, gambar } from "@/lib/data";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Poliklinik & Spesialisasi",
  description:
    "Daftar poliklinik dan spesialisasi yang tersedia di RSU Mahkota Bidadari beserta jumlah dokternya.",
};

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

export default async function PoliklinikPage() {
  const poliList = await getPoliList();
  const totalDokter = poliList.reduce((n, p) => n + Number(p.jumlah_dokter ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Fasilitas & Layanan"
        title="Poliklinik & Spesialisasi"
        description={`${poliList.length} poliklinik dengan ${totalDokter} jadwal dokter spesialis. Pilih poliklinik untuk melihat dokter yang praktik.`}
        crumbs={[
          { label: "Fasilitas & Layanan", href: "/layanan" },
          { label: "Poliklinik" },
        ]}
      />

      <section className="container-page py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {poliList.map((p) => (
            <li key={p.id_poli}>
              <Link
                href={`/dokter?poli=${encodeURIComponent(p.id_poli)}`}
                className="group card-hover flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
                  <Image
                    src={gambar(p.images)}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="scale-110 object-cover opacity-70 blur-lg"
                  />
                  <div className="absolute inset-0 bg-brand-900/10" aria-hidden />
                  <Image
                    src={gambar(p.images)}
                    alt={p.nama_poli}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="z-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-sm font-semibold leading-snug text-brand-900">{p.nama_poli}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {Number(p.jumlah_dokter ?? 0)} dokter · lihat jadwal
                  </span>
                  {p.ket && (
                    <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-muted">
                      {p.ket.replace(/<[^>]+>/g, "").trim()}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-muted">
          Poliklinik lain seperti Patologi Klinik, Radiologi, dan Unit Dialisis tersedia sebagai
          layanan penunjang. Lihat{" "}
          <Link href="/fasilitas" className="font-semibold text-brand-800 hover:underline">
            fasilitas rumah sakit
          </Link>
          .
        </p>
      </section>
    </>
  );
}
