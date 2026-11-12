import type { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import LamaranForm from "@/components/lamaran-form";
import { getKarierAktif, getCompany, tanggalRapi, bersihkanHtml } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Karier") };
}

export const dynamic = "force-dynamic";

export default async function KarierPage() {
  const lang = await bacaBahasa();
  const [lowongan, company] = await Promise.all([getKarierAktif(), getCompany()]);
  const email = company?.email ?? "bidadaribinjai@gmail.com";

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Karier")}
        description={tx(lang, "RSU Mahkota Bidadari membuka kesempatan bagi tenaga medis, keperawatan, penunjang medis, dan non-medis yang ingin berkembang bersama.")}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: tx(lang, "Karier") },
        ]}
      />

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="section-title text-xl">{tx(lang, "Lowongan tersedia")}</h2>

          {lowongan.length === 0 ? (
            <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold text-brand-900">{tx(lang, "Belum ada lowongan yang dipublikasikan saat ini")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{tx(lang, "Kami tetap menerima lamaran untuk posisi tenaga medis, keperawatan, penunjang medis, dan administrasi. Kirim data Anda lewat formulir di samping — akan kami simpan sebagai bank kandidat.")}</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowongan.map((l) => (
                <li
                  key={l.id}
                  className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-brand-900">{l.posisi}</h3>
                    <span className="rounded bg-brand/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-900">
                      {l.jenis}
                    </span>
                    {l.unit && <span className="text-xs text-muted">· {l.unit}</span>}
                  </div>
                  {l.dibuat && (
                    <p className="mt-1 text-xs text-muted">Dipublikasikan {tanggalRapi(l.dibuat)}</p>
                  )}
                  {l.deskripsi && (
                    <div
                      className="mt-3 space-y-2 text-sm leading-relaxed text-muted [&_li]:ml-5 [&_li]:list-disc"
                      dangerouslySetInnerHTML={{ __html: bersihkanHtml(l.deskripsi) }}
                    />
                  )}
                  {l.kualifikasi && (
                    <>
                      <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-800">
                        Kualifikasi
                      </h4>
                      <div
                        className="mt-1 space-y-1 text-sm text-muted [&_li]:ml-5 [&_li]:list-disc"
                        dangerouslySetInnerHTML={{ __html: bersihkanHtml(l.kualifikasi) }}
                      />
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-mist p-5">
            <h2 className="text-sm font-semibold text-brand-900">{tx(lang, "Alur melamar")}</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>{tx(lang, "Isi formulir lamaran di samping, Anda akan menerima nomor lamaran.")}</li>
              <li>
                {tx(lang, "Kirim CV dan dokumen pendukung ke")}{" "}
                <a href={`mailto:${email}`} className="font-semibold text-brand-800 underline">
                  {email}
                </a>{" "}
                {tx(lang, "dengan subjek nomor lamaran.")}
              </li>
              <li>{tx(lang, "Kandidat yang sesuai akan dihubungi untuk tahap berikutnya.")}</li>
            </ol>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <LamaranForm lang={lang} posisiList={lowongan.map((l) => l.posisi)} />
        </div>
      </section>
    </>
  );
}
