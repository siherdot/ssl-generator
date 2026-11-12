import Link from "next/link";
import Hero from "@/components/hero";
import QuickActions from "@/components/quick-actions";
import HubungiKami from "@/components/hubungi-kami";
import DoctorCard from "@/components/doctor-card";
import InfoCard from "@/components/info-card";
import Carousel from "@/components/carousel";
import { JsonLdHospital } from "@/components/json-ld";
import { site } from "@/lib/site";
import {
  getDokterList,
  getNewsList,
  getPoliList,
  getPromoAktif,
  getTestimoni,
  getKasur,
  getSlideLatar,
  hitungRingkas,
  gambar,
  tanggalRapi,
} from "@/lib/data";
import { urlGambar } from "@/lib/gambar";
import { bacaBahasa } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lang = await bacaBahasa();
  const [ringkas, poliList, dokterList, berita] = await Promise.all([
    hitungRingkas(),
    getPoliList(),
    getDokterList(),
    getNewsList(8),
  ]);
  const [promo, testimoni, kasur, slide] = await Promise.all([
    getPromoAktif(6),
    getTestimoni(6),
    getKasur(),
    getSlideLatar(),
  ]);

  const totalKasur = kasur.reduce((n, k) => n + Number(k.total || 0), 0);
  const terisiKasur = kasur.reduce((n, k) => n + Number(k.terisi || 0), 0);
  const kosongKasur = Math.max(0, totalKasur - terisiKasur);

  const stats = [
    { value: String(ringkas?.dokter ?? 0), label: t(lang, "home.statistik.dokter") },
    { value: String(ringkas?.poli ?? 0), label: t(lang, "home.statistik.poli") },
    { value: String(totalKasur), label: t(lang, "home.statistik.tidur") },
    { value: `${new Date().getFullYear() - site.founded}`, label: t(lang, "home.statistik.tahun") },
  ];

  // poli dengan dokter terbanyak tampil lebih dulu
  const poliUnggulan = [...poliList]
    .sort((a, b) => Number(b.jumlah_dokter ?? 0) - Number(a.jumlah_dokter ?? 0))
    .slice(0, 9);

  // satu dokter per poli, maksimal 6, untuk variasi
  const dokterSorot = Object.values(
    dokterList.reduce<Record<string, (typeof dokterList)[number]>>((acc, d) => {
      if (!acc[d.id_poli]) acc[d.id_poli] = d;
      return acc;
    }, {})
  ).slice(0, 9);

  return (
    <>
      <JsonLdHospital />
      <Hero fotoLatar={slide.map((s) => urlGambar(s.images))} lang={lang} />
      <QuickActions lang={lang} />

      {/* tentang singkat */}
      <section className="border-b border-line bg-mint/40 py-10 lg:py-12" aria-labelledby="tentang-singkat">
        <div className="container-page grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">{t(lang, "home.tentang.label")}</p>
            <h2 id="tentang-singkat" className="section-title mt-2 text-2xl lg:text-3xl">
              {t(lang, "home.tentang.judul")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted lg:text-base">
              {t(lang, "home.tentang.isi")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tentang" className="rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
                {t(lang, "home.tentang.profil")}
              </Link>
              <Link href="/tentang#visi-misi" className="rounded-lg border border-brand-900/20 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-white">
                {t(lang, "home.tentang.visi")}
              </Link>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-900">{t(lang, "home.layanan.judul")}</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                lang === "en" ? "24-Hour Emergency" : "UGD 24 Jam",
                lang === "en" ? "Specialist Outpatient Care" : "Rawat Jalan Spesialis",
                lang === "en" ? "Inpatient Care" : "Rawat Inap",
                lang === "en" ? "Laboratory" : "Laboratorium",
                lang === "en" ? "Radiology" : "Radiologi",
                lang === "en" ? "Dialysis Unit" : "Unit Dialisis",
                lang === "en" ? "Medical Rehabilitation" : "Rehabilitasi Medik",
                lang === "en" ? "Pharmacy" : "Farmasi",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ketersediaan kamar — hanya tampil bila datanya sudah ada */}
      {kasur.length > 0 && (
        <section className="container-page pt-8" aria-labelledby="ketersediaan-kamar">
          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-brand/40 bg-brand/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="ketersediaan-kamar" className="text-sm font-semibold uppercase tracking-wide text-brand-900">
                Ketersediaan tempat tidur hari ini
              </h2>
              <p className="mt-1 text-sm text-ink">
                <strong>{kosongKasur}</strong> kosong dari <strong>{totalKasur}</strong> tempat tidur
                <span className="text-muted"> · {terisiKasur} terisi</span>
              </p>
            </div>
            <Link
              href="/informasi/ketersediaan-kamar"
              className="shrink-0 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Lihat rincian per kelas
            </Link>
          </div>
        </section>
      )}

      {/* statistik */}
      <section className="container-page py-12" aria-label="Ringkasan layanan">
        <ul className="grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-line bg-mist p-6 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="text-center">
              <p className="text-3xl font-bold text-brand-900 lg:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted lg:text-sm">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* poliklinik unggulan */}
      <section className="container-page pb-12" aria-labelledby="layanan-unggulan">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">Layanan</p>
        <h2 id="layanan-unggulan" className="section-title mt-2 text-2xl lg:text-3xl">
          Poliklinik &amp; Spesialisasi
        </h2>

        <div className="mt-6">
          <Carousel label="poliklinik">
            {poliUnggulan.map((p) => (
              <div key={p.id_poli} className="carousel-item">
                <InfoCard
                  title={p.nama_poli}
                  description={`${Number(p.jumlah_dokter ?? 0)} dokter · ${
                    p.ket ? p.ket.replace(/<[^>]+>/g, "").trim() : "Layanan rawat jalan"
                  }`}
                  image={gambar(p.images)}
                  href={`/dokter?poli=${encodeURIComponent(p.id_poli)}`}
                  ctaLabel="Lihat dokter"
                  rasio="aspect-[4/3]"
                  latarBlur
                />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* dokter */}
      <section className="border-y border-line bg-mist py-12" aria-labelledby="dokter-sorot">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">Tim Medis</p>
          <h2 id="dokter-sorot" className="section-title mt-2 text-2xl lg:text-3xl">
            Dokter Spesialis
          </h2>

          <div className="mt-6">
            <Carousel label="dokter">
              {dokterSorot.map((d) => (
                <div key={d.id_dokter} className="carousel-item">
                  <DoctorCard dokter={d} />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* berita */}
      <section className="container-page py-12" aria-labelledby="berita-terbaru">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">Informasi</p>
        <h2 id="berita-terbaru" className="section-title mt-2 text-2xl lg:text-3xl">
          Berita &amp; Kegiatan
        </h2>

        <div className="mt-6">
          <Carousel label="berita">
            {berita.map((n) => (
              <div key={n.news_id} className="carousel-item">
                <InfoCard
                  title={n.title}
                  description={tanggalRapi(n.create_date) ?? undefined}
                  image={gambar(n.news_images)}
                  href={`/informasi/berita/${encodeURIComponent(n.news_id)}`}
                  ctaLabel="Baca"
                  rasio="aspect-[4/5]"
                  latarBlur
                />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* promo — hanya tampil bila ada data aktif */}
      {promo.length > 0 && (
        <section className="border-y border-line bg-mist py-12" aria-labelledby="promo-aktif">
          <div className="container-page">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">Penawaran</p>
            <h2 id="promo-aktif" className="section-title mt-2 text-2xl lg:text-3xl">
              Promo &amp; Paket
            </h2>
            <div className="mt-6">
              <Carousel label="promo">
                {promo.map((p) => (
                  <div key={p.id} className="carousel-item">
                    <InfoCard
                      title={p.judul}
                      description={p.deskripsi?.replace(/<[^>]+>/g, "").slice(0, 160)}
                      image={gambar(p.gambar)}
                      href={p.link || undefined}
                      ctaLabel="Lihat detail"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* testimoni — hanya tampil bila ada data */}
      {testimoni.length > 0 && (
        <section className="container-page py-12" aria-labelledby="testimoni-pasien">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">Pengalaman Pasien</p>
          <h2 id="testimoni-pasien" className="section-title mt-2 text-2xl lg:text-3xl">
            Kata Pasien Kami
          </h2>
          <div className="mt-6">
            <Carousel label="testimoni">
              {testimoni.map((t) => (
                <div key={t.id} className="carousel-item">
                  <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
                    <blockquote className="text-sm italic leading-relaxed text-ink">“{t.isi}”</blockquote>
                    <figcaption className="mt-auto pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-900">{t.nama}</p>
                      <p className="text-[11px] text-muted">
                        {tanggalRapi(t.tanggal) ?? "Pasien RSU Mahkota Bidadari"}
                      </p>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      <HubungiKami />
    </>
  );
}
