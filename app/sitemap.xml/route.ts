import { getDokterList, getNewsList } from "@/lib/data";

export const dynamic = "force-dynamic";

const BASE = "https://rsumb.rsumb.site";

/**
 * Sitemap dibuat saat request (bukan saat build) karena build Docker
 * tidak punya akses ke database.
 */
export async function GET() {
  const statis = [
    { loc: "/", priority: "1.0", freq: "weekly" },
    { loc: "/layanan", priority: "0.9", freq: "monthly" },
    { loc: "/layanan/poliklinik", priority: "0.9", freq: "weekly" },
    { loc: "/layanan/rawat-inap", priority: "0.7", freq: "monthly" },
    { loc: "/layanan/penunjang", priority: "0.7", freq: "monthly" },
    { loc: "/layanan/mcu", priority: "0.7", freq: "monthly" },
    { loc: "/fasilitas", priority: "0.7", freq: "monthly" },
    { loc: "/dokter", priority: "0.9", freq: "daily" },
    { loc: "/informasi", priority: "0.6", freq: "monthly" },
    { loc: "/informasi/ketersediaan-kamar", priority: "0.9", freq: "hourly" },
    { loc: "/informasi/berita", priority: "0.8", freq: "weekly" },
    { loc: "/informasi/asuransi", priority: "0.7", freq: "monthly" },
    { loc: "/informasi/alur-pendaftaran", priority: "0.6", freq: "yearly" },
    { loc: "/informasi/karier", priority: "0.6", freq: "weekly" },
    { loc: "/informasi/faq", priority: "0.6", freq: "monthly" },
    { loc: "/tentang", priority: "0.6", freq: "yearly" },
    { loc: "/kontak", priority: "0.7", freq: "yearly" },
    { loc: "/daftar-online", priority: "0.9", freq: "monthly" },
  ];

  let dokter: { id_dokter: string }[] = [];
  let berita: { news_id: string }[] = [];
  try {
    [dokter, berita] = await Promise.all([
      getDokterList() as unknown as Promise<{ id_dokter: string }[]>,
      getNewsList() as unknown as Promise<{ news_id: string }[]>,
    ]);
  } catch {
    // kalau DB tidak bisa dihubungi, sitemap tetap keluar dengan halaman statis
  }

  const url = (loc: string, priority: string, freq: string, lastmod?: string) =>
    [
      "  <url>",
      `    <loc>${BASE}${loc}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
      `    <changefreq>${freq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");

  const hariIni = new Date().toISOString().slice(0, 10);

  const isi = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...statis.map((s) => url(s.loc, s.priority, s.freq, hariIni)),
    ...dokter.map((d) =>
      url(`/dokter/${encodeURIComponent(d.id_dokter)}`, "0.7", "monthly")
    ),
    ...berita.map((n) =>
      url(`/informasi/berita/${encodeURIComponent(n.news_id)}`, "0.6", "yearly")
    ),
    "</urlset>",
  ].join("\n");

  return new Response(isi, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
