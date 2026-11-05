import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { getPoliList, getFacilityList } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fasilitas & Layanan",
  description:
    "Layanan RSU Mahkota Bidadari: UGD 24 jam, rawat jalan spesialis, rawat inap, penunjang medis, dan medical check up.",
};

export const dynamic = "force-dynamic";

const layanan = [
  {
    href: "/layanan/poliklinik",
    title: "Poliklinik & Spesialisasi",
    desc: "Layanan rawat jalan per spesialisasi dengan dokter jadwal tetap.",
  },
  {
    href: "/layanan/rawat-inap",
    title: "Rawat Inap",
    desc: "Kelas perawatan III, II, I, VIP, serta ICU, NICU & Baby.",
  },
  {
    href: "/layanan/penunjang",
    title: "Penunjang Medis",
    desc: "Laboratorium, radiologi, farmasi, bank darah, cathlab, dan dialisis.",
  },
  {
    href: "/layanan/mcu",
    title: "Medical Check Up",
    desc: "Pemeriksaan kesehatan berkala untuk individu maupun perusahaan.",
  },
  {
    href: "/fasilitas",
    title: "Fasilitas Umum",
    desc: "Area parkir, ATM, musala, laundry, dan fasilitas pendukung lain.",
  },
];

export default async function LayananPage() {
  const [poli, fasilitas] = await Promise.all([getPoliList(), getFacilityList()]);

  return (
    <>
      <PageHeader
        eyebrow="Fasilitas & Layanan"
        title="Layanan Rumah Sakit"
        description="Layanan darurat, rawat jalan, rawat inap, dan penunjang medis dalam satu rumah sakit."
        crumbs={[{ label: "Fasilitas & Layanan" }]}
      />

      <section className="container-page py-8">
        <ul className="grid gap-4 sm:grid-cols-2">
          {layanan.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="card-hover flex h-full flex-col justify-between rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <span>
                  <span className="block text-base font-semibold text-brand-900">{l.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{l.desc}</span>
                </span>
                <span className="mt-4 text-xs font-semibold text-brand-800">Selengkapnya →</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-4 rounded-[var(--radius-card)] border border-line bg-mist p-5 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-bold text-brand-900">{poli.length}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Poliklinik</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-900">{fasilitas.length}</p>
            <p className="text-xs uppercase tracking-wide text-muted">Fasilitas & unit</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-900">24 jam</p>
            <p className="text-xs uppercase tracking-wide text-muted">IGD setiap hari</p>
          </div>
        </div>
      </section>
    </>
  );
}
