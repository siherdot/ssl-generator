import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import SurveiForm from "@/components/survei-form";
import PetaEmbed from "@/components/peta-embed";
import { getCompany, getPoliRingkas } from "@/lib/data";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return {
    title: tx(lang, "Survei Kepuasan"),
    description:
      lang === "en"
        ? `Patient satisfaction survey for ${site.name} — rate registration, doctors, nurses, facilities, and cleanliness.`
        : `Survei kepuasan pasien ${site.name} — nilai pelayanan pendaftaran, dokter, perawat, fasilitas, dan kebersihan.`,
  };
}

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const lang = await bacaBahasa();
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

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Survei Kepuasan")}
        description={tx(lang, "Beri penilaian pelayanan yang Anda terima. Untuk kondisi darurat, langsung hubungi IGD.")}
        crumbs={[{ label: tx(lang, "Pusat Informasi"), href: "/informasi" }, { label: tx(lang, "Survei Kepuasan") }]}
      />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SurveiForm lang={lang} unitList={unitList} />
        </div>

        <aside className="space-y-4">
          <PetaEmbed judul={`Peta lokasi ${site.name}`} tinggi="h-[200px]" />

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{tx(lang, "Alamat")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">{alamat}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery + ", Kabupaten Langkat")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-brand-800 underline"
            >
              {tx(lang, "Buka di Google Maps")}
            </a>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{tx(lang, "Telepon")}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">{tx(lang, "Telepon")}</span>
                <a href={`tel:${telepon.replace(/[^0-9+]/g, "")}`} className="font-semibold text-ink">
                  {telepon}
                </a>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">{tx(lang, "IGD 24 jam")}</span>
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
            <p className="mt-1 text-xs leading-relaxed text-muted">{tx(lang, "Pendaftaran rawat jalan lewat aplikasi Mobile JKN BPJS Kesehatan.")}</p>
            <Link
              href="/daftar-online"
              className="mt-3 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Daftar via Mobile JKN
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
