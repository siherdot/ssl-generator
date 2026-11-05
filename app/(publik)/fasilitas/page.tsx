import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
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
  const fasilitas = await getFacilityList();

  return (
    <>
      <PageHeader
        eyebrow="Fasilitas"
        title="Fasilitas Rumah Sakit"
        description={`${fasilitas.length} fasilitas dan unit layanan yang menunjang perawatan pasien di RSU Mahkota Bidadari.`}
        crumbs={[{ label: "Fasilitas" }]}
      />

      <section className="container-page py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fasilitas.map((f) => (
            <InfoCard
              key={f.id_facility}
              title={f.facility_name}
              description={f.facility_description?.replace(/<[^>]+>/g, "").trim()}
              image={gambar(f.facility_image)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
