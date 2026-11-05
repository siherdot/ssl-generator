import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import SurveiForm from "@/components/survei-form";
import Image from "next/image";
import { getCompany, getPoliRingkas } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Survei Kepuasan",
  description:
    "Survei kepuasan pasien RSU Mahkota Bidadari — nilai pelayanan pendaftaran, dokter, perawat, fasilitas, dan kebersihan.",
};

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const [company, poli] = await Promise.all([getCompany(), getPoliRingkas()]);
  const alamat = company?.alamat ?? site.address;
  const telepon = company?.phone ?? site.phone;
  const igd = company?.igd_phone ?? site.igd;
  const email = company?.email ?? site.email;
  const unitList = [
    ...poli.map((p) => p.nama_poli),
    "IGD",
    "Rawat Inap",
    "Laboratorium",
    "Radiologi",
    "Farmasi",
    "Pendaftaran",
  ];
  const { lat, lon } = site.koordinat;

  return (
    <>
      <PageHeader
        eyebrow="Pusat Informasi"
        title="Survei Kepuasan"
        description="Beri penilaian pelayanan yang Anda terima. Untuk kondisi darurat, langsung hubungi IGD."
        crumbs={[{ label: "Pusat Informasi", href: "/informasi" }, { label: "Survei Kepuasan" }]}
      />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SurveiForm unitList={unitList} />
        </div>

        <aside className="space-y-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-[var(--radius-card)] border border-line shadow-[var(--shadow-card)]"
            aria-label={`Buka lokasi ${site.name} di Google Maps`}
          >
            <Image
              src="/images/peta-rsu.jpg"
              alt={`Peta lokasi ${site.name}`}
              width={768}
              height={512}
              sizes="(max-width: 1024px) 100vw, 360px"
              className="h-[200px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">Alamat</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">{alamat}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery + ", Kabupaten Langkat")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-brand-800 underline"
            >
              Buka di Google Maps
            </a>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">Telepon</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">Telepon</span>
                <a href={`tel:${telepon.replace(/[^0-9+]/g, "")}`} className="font-semibold text-ink">
                  {telepon}
                </a>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">IGD 24 jam</span>
                <a href={`tel:${igd.replace(/[^0-9+]/g, "")}`} className="font-semibold text-red-600">
                  {igd}
                </a>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">WhatsApp</span>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink"
                >
                  {site.whatsappLabel}
                </a>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">Email</span>
                <a href={`mailto:${email}`} className="font-semibold text-ink">
                  {email}
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
            <h2 className="text-sm font-semibold text-brand-900">Ingin berobat?</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Isi formulir pendaftaran online agar tidak mengisi ulang di loket.
            </p>
            <Link
              href="/daftar-online"
              className="mt-3 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Pendaftaran online
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
