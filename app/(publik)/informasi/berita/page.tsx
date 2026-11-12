import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { dua, tx } from "@/lib/teks-en";
import InfoCard from "@/components/info-card";
import { getNewsList, gambar, tanggalRapi } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return { title: tx(lang, "Berita & Kegiatan") };
}

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

const PER_HALAMAN = 12;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ tampil?: string }>;
}) {
  const lang = await bacaBahasa();
  const { tampil } = await searchParams;
  const berita = await getNewsList();
  const [utama, ...sisa] = berita;

  const diminta = Number.parseInt(tampil ?? "", 10);
  const batas = Number.isFinite(diminta)
    ? Math.min(Math.max(diminta, PER_HALAMAN), berita.length)
    : Math.min(PER_HALAMAN, berita.length);

  const lain = sisa.slice(0, Math.max(batas - 1, 0));
  const adaLagi = lain.length + 1 < berita.length;
  const berikut = Math.min(lain.length + 1 + PER_HALAMAN, berita.length);

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Pusat Informasi")}
        title={tx(lang, "Berita & Kegiatan")}
        description={lang === "en" ? `${berita.length} news items and events from RSU Mahkota Bidadari.` : `${berita.length} berita dan kegiatan dari RSU Mahkota Bidadari.`}
        crumbs={[
          { label: tx(lang, "Pusat Informasi"), href: "/informasi" },
          { label: "Berita" },
        ]}
      />

      <section className="container-page py-8">
        {!utama ? (
          <p className="text-sm text-muted">Belum ada berita.</p>
        ) : (
          <div className="space-y-8">
            {/* sorotan */}
            <Link
              href={`/informasi/berita/${encodeURIComponent(utama.news_id)}`}
              className="group grid gap-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)] sm:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-mist">
                <Image
                  src={gambar(utama.news_images)}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 100vw, 340px"
                  className="scale-110 object-cover opacity-70 blur-lg"
                />
                <div className="absolute inset-0 bg-brand-900/10" aria-hidden />
                <Image
                  src={gambar(utama.news_images)}
                  alt={dua(lang, utama.title, utama.title_en)}
                  fill
                  sizes="(max-width: 640px) 100vw, 340px"
                  className="z-10 object-contain"
                />
              </div>
              <div className="flex flex-col justify-center p-6">
                <span className="w-fit rounded bg-brand-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {tx(lang, "Terbaru")}
                </span>
                <h2 className="mt-3 text-xl font-bold leading-snug text-brand-900 group-hover:text-brand-800 lg:text-2xl">
                  {dua(lang, utama.title, utama.title_en)}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                  {dua(lang, utama.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), utama.content_en?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())}
                </p>
                <p className="mt-4 text-xs text-muted">
                  {tanggalRapi(utama.create_date) ?? "—"}
                </p>
              </div>
            </Link>

            {lain.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lain.map((n) => (
                  <InfoCard
                    key={n.news_id}
                    title={dua(lang, n.title, n.title_en)}
                    description={`${tanggalRapi(n.create_date) ?? ""} ${
                      dua(lang, n.content?.replace(/<[^>]+>/g, " "), n.content_en?.replace(/<[^>]+>/g, " "))?.slice(0, 140) ?? ""
                    }`.trim()}
                    image={gambar(n.news_images)}
                    href={`/informasi/berita/${encodeURIComponent(n.news_id)}`}
                    ctaLabel={tx(lang, "Baca")}
                    rasio="aspect-[4/5]"
                    latarBlur
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-muted">
                {lang === "en" ? `Showing ${lain.length + 1} of ${berita.length} news items` : `Menampilkan ${lain.length + 1} dari ${berita.length} berita`}
              </p>
              {adaLagi ? (
                <Link
                  href={`/informasi/berita?tampil=${berikut}#daftar`}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-800 px-6 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-800 hover:text-white"
                  scroll={false}
                >
                  Lihat lebih banyak
                  <span aria-hidden="true">↓</span>
                </Link>
              ) : (
                berita.length > PER_HALAMAN && (
                  <Link
                    href="/informasi/berita"
                    className="text-xs font-semibold text-brand-800 hover:underline"
                    scroll={false}
                  >
                    Ringkas kembali
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
