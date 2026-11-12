import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua, tx } from "@/lib/teks-en";
import { getPoliList, gambar } from "@/lib/data";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Poliklinik & Spesialisasi") };
}

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

export default async function PoliklinikPage() {
  const lang = await bacaBahasa();
  const poliList = await getPoliList();
  const totalDokter = poliList.reduce((n, p) => n + Number(p.jumlah_dokter ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Fasilitas & Layanan")}
        title={tx(lang, "Poliklinik & Spesialisasi")}
        description={lang === "en" ? `${poliList.length} clinics with ${totalDokter} specialist schedules. Choose a clinic to see the doctors on duty.` : `${poliList.length} poliklinik dengan ${totalDokter} jadwal dokter spesialis. Pilih poliklinik untuk melihat dokter yang praktik.`}
        crumbs={[
          { label: tx(lang, "Fasilitas & Layanan"), href: "/layanan" },
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
                    alt={dua(lang, p.nama_poli, p.nama_poli_en)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="z-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-sm font-semibold leading-snug text-brand-900">{dua(lang, p.nama_poli, p.nama_poli_en)}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {lang === "en" ? `${Number(p.jumlah_dokter ?? 0)} doctors · see schedule` : `${Number(p.jumlah_dokter ?? 0)} dokter · lihat jadwal`}
                  </span>
                  {p.ket && (
                    <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-muted">
                      {dua(lang, p.ket.replace(/<[^>]+>/g, "").trim(), p.ket_en?.replace(/<[^>]+>/g, "").trim())}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-muted">
          {lang === "en" ? "Other clinics such as Clinical Pathology, Radiology, and the Dialysis Unit are available as supporting services. See " : "Poliklinik lain seperti Patologi Klinik, Radiologi, dan Unit Dialisis tersedia sebagai layanan penunjang. Lihat "}{" "}
          <Link href="/fasilitas" className="font-semibold text-brand-800 hover:underline">
            {lang === "en" ? "hospital facilities" : "fasilitas rumah sakit"}
          </Link>
          .
        </p>
      </section>
    </>
  );
}
