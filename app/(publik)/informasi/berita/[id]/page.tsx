import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua } from "@/lib/teks-en";
import { bersihkanHtml, gambar, getNews, tanggalRapi } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const berita = await getNews(decodeURIComponent(id));
  if (!berita) return { title: "Berita tidak ditemukan" };
  const tanggal = tanggalRapi(berita.create_date);
  return {
    title: berita.title,
    description: `Berita RSU Mahkota Bidadari${tanggal ? ` — ${tanggal}` : ""}.`,
  };
}

export default async function DetailBerita({ params }: { params: Params }) {
  const lang = await bacaBahasa();
  const { id } = await params;
  const berita = await getNews(decodeURIComponent(id));
  if (!berita) notFound();

  const tanggal = tanggalRapi(berita.create_date);
  const isi = bersihkanHtml(dua(lang, berita.content, berita.content_en));

  return (
    <>
      <PageHeader
        eyebrow="Pusat Informasi"
        title={dua(lang, berita.title, berita.title_en)}
        description={tanggal ? (lang === "en" ? `Published ${tanggal}` : `Dipublikasikan ${tanggal}`) : undefined}
        crumbs={[
          { label: "Pusat Informasi", href: "/informasi" },
          { label: "Berita & Kegiatan", href: "/informasi/berita" },
          { label: "Detail" },
        ]}
      />

      <article className="container-page py-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          {berita.news_images && (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] border border-line bg-mist">
              <Image
                src={gambar(berita.news_images)}
                alt={dua(lang, berita.title, berita.title_en)}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="space-y-3 text-[15px] leading-relaxed text-ink [&_a]:text-brand-800 [&_a]:underline [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: isi }}
          />

          <div className="mt-10 border-t border-line pt-6">
            <Link
              href="/informasi/berita"
              className="inline-block rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-mist"
            >
              ← Semua berita
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
