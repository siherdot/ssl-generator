import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua, tx } from "@/lib/teks-en";
import InfoCard from "@/components/info-card";
import { getFacilityList, gambar } from "@/lib/data";

export const metadata: Metadata = {
  title: "Penunjang Medis",
  description:
    "Unit penunjang medis RSU Mahkota Bidadari: laboratorium, radiologi, farmasi, bank darah, cathlab, dialisis, dan perawatan intensif.",
};

export const dynamic = "force-dynamic";

// dikelompokkan supaya mudah dibaca; nama unit diambil apa adanya dari database
const penunjang = ["LABORATORIUM", "RADIOLOGI", "FARMASI", "BANK DARAH", "CATHLAB - KATETERISASI JANTUNG", "UNIT DIALISIS", "UNIT GIZI"];
const intensif = ["ICU", "NICU", "INSTALASI GAWAT DARURAT (IGD)", "KAMAR BERSALIN"];
const umum = ["AREA PARKIR", "ATM CENTRE", "MUSHOLLA", "UNIT LAUNDRY"];

export default async function PenunjangPage() {
  const lang = await bacaBahasa();
  const semua = await getFacilityList();
  const cari = (nama: string) => semua.find((f) => f.facility_name.toUpperCase() === nama);

  const kelompok = [
    { judul: "Penunjang medis", kunci: penunjang },
    { judul: "Perawatan intensif & tindakan", kunci: intensif },
    { judul: "Penunjang umum", kunci: umum },
  ];

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Fasilitas & Layanan")}
        title={tx(lang, "Penunjang Medis")}
        description={tx(lang, "Pemeriksaan dan tindakan penunjang yang mendukung penegakan diagnosis serta perawatan pasien.")}
        crumbs={[
          { label: tx(lang, "Fasilitas & Layanan"), href: "/layanan" },
          { label: tx(lang, "Penunjang Medis") },
        ]}
      />

      <section className="container-page space-y-10 py-8">
        {kelompok.map((k) => {
          const item = k.kunci.map(cari).filter((f): f is NonNullable<typeof f> => Boolean(f));
          if (item.length === 0) return null;
          return (
            <div key={tx(lang, k.judul)}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">{tx(lang, k.judul)}</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {item.map((f) => (
                  <InfoCard
                    key={f.id_facility + f.facility_name}
                    title={f.facility_name}
                    description={dua(lang, f.facility_description?.replace(/<[^>]+>/g, "").trim(), f.facility_description_en?.replace(/<[^>]+>/g, "").trim())}
                    image={gambar(f.facility_image)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-muted">
          {lang === "en" ? "The full facility list is on " : "Daftar fasilitas lengkap ada di "}{" "}
          <Link href="/fasilitas" className="font-semibold text-brand-800 underline">
            {lang === "en" ? "the facilities page" : "halaman fasilitas"}
          </Link>
          . Ketersediaan alat dan jam operasional unit dapat berubah — konfirmasi ke (061) 8830003.
        </p>
      </section>
    </>
  );
}
