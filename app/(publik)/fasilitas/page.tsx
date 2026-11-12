import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua, tx } from "@/lib/teks-en";
import InfoCard from "@/components/info-card";
import { getFacilityList, gambar } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fasilitas Rumah Sakit",
  description:
    "Fasilitas RSU Mahkota Bidadari: IGD, rawat inap, bank darah, laboratorium, radiologi, dan fasilitas pendukung.",
};

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

export default async function FasilitasPage() {
  const lang = await bacaBahasa();
  const fasilitas = await getFacilityList();

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Fasilitas")}
        title={tx(lang, "Fasilitas Rumah Sakit")}
        description={lang === "en" ? `${fasilitas.length} facilities and service units supporting patient care at RSU Mahkota Bidadari.` : `${fasilitas.length} fasilitas dan unit layanan yang menunjang perawatan pasien di RSU Mahkota Bidadari.`}
        crumbs={[{ label: tx(lang, "Fasilitas") }]}
      />

      <section className="container-page py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fasilitas.map((f) => (
            <InfoCard
              key={f.id_facility}
              title={dua(lang, f.facility_name, f.facility_name_en)}
              description={dua(lang, f.facility_description?.replace(/<[^>]+>/g, "").trim(), f.facility_description_en?.replace(/<[^>]+>/g, "").trim())}
              image={gambar(f.facility_image)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
