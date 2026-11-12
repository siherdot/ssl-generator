import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua, tx } from "@/lib/teks-en";
import { getCompany, bersihkanHtml } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil, sejarah, visi, dan misi RSU Mahkota Bidadari — rumah sakit umum di Kabupaten Langkat, Sumatera Utara.",
};

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

export default async function TentangPage() {
  const lang = await bacaBahasa();
  const company = await getCompany();

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Tentang Kami")}
        title={tx(lang, "Profil RSU Mahkota Bidadari")}
        description={company?.slogan ?? undefined}
        crumbs={[{ label: tx(lang, "Tentang Kami") }]}
      />

      <section className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article>
            <h2 className="text-lg font-semibold text-brand-900">Sekilas Rumah Sakit</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted lg:text-base">
              {dua(lang, company?.company_description?.trim(), company?.company_description_en?.trim())}
            </p>

            <h2 id="visi-misi" className="mt-10 scroll-mt-24 text-lg font-semibold text-brand-900">
              Visi &amp; Misi
            </h2>
            <div className="mt-3 grid gap-5 md:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-800">Visi</h3>
                <div
                  className="mt-2 text-sm leading-relaxed text-ink [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: bersihkanHtml(dua(lang, company?.visi, company?.visi_en)) }}
                />
              </div>
              <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-800">Misi</h3>
                <div
                  className="mt-2 text-sm leading-relaxed text-ink [&_br]:hidden [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: bersihkanHtml(dua(lang, company?.misi, company?.misi_en)) }}
                />
              </div>
            </div>

            {company?.link_youtube_profile && (
              <a
                href={company.link_youtube_profile}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
              >
                ▶ Video profil rumah sakit
              </a>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900">Kontak</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">Alamat</dt>
                  <dd className="mt-0.5 leading-relaxed">{company?.alamat}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Telepon</dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${(company?.phone ?? "").replace(/[^0-9+]/g, "")}`} className="font-semibold text-brand-800">
                      {company?.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">IGD</dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${(company?.igd_phone ?? "").replace(/[^0-9+]/g, "")}`} className="font-semibold text-brand-800">
                      {company?.igd_phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Email</dt>
                  <dd className="mt-0.5">
                    <a href={`mailto:${company?.email}`} className="text-brand-800">{company?.email}</a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
              <h2 className="text-sm font-semibold text-brand-900">Ingin berobat?</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Pendaftaran lewat aplikasi Mobile JKN BPJS Kesehatan.
              </p>
              <Link
                href="/daftar-online"
                className="mt-3 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
              >
                Daftar via Mobile JKN
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
