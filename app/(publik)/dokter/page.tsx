import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import DoctorCard from "@/components/doctor-card";
import { getDokterList, getPoliList, HARI_OPTIONS } from "@/lib/data";
import { bacaBahasa } from "@/lib/i18n-server";
import { namaHari, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Cari Dokter & Jadwal Praktik",
  description:
    "Telusuri dokter RSU Mahkota Bidadari berdasarkan nama, poliklinik, dan hari praktik. Jadwal hari ini tampil otomatis.",
};

// force-dynamic: halaman butuh koneksi database, dan image Docker tidak
// punya akses DB saat `next build`. Cache/ISR dirapikan di Fase E.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; poli?: string; hari?: string }>;

/**
 * Nama hari ini menurut zona waktu rumah sakit (WIB), bukan waktu server.
 * Dipakai sebagai nilai awal filter supaya pengunjung langsung melihat
 * jadwal yang berlaku hari ini.
 */
function hariIniJakarta() {
  const singkat = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const peta: Record<string, string> = {
    Mon: "Senin",
    Tue: "Selasa",
    Wed: "Rabu",
    Thu: "Kamis",
    Fri: "Jum'at",
    Sat: "Sabtu",
    Sun: "Minggu",
  };
  return peta[singkat] ?? "Senin";
}

export default async function DokterPage({ searchParams }: { searchParams: SearchParams }) {
  const lang = await bacaBahasa();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const poli = sp.poli ?? "";

  const hariIni = hariIniJakarta();
  // Tanpa parameter "hari" → otomatis hari ini. "semua" → tanpa filter hari.
  const hariDipilih = sp.hari === undefined ? hariIni : sp.hari;
  const tanpaHari = hariDipilih === "" || hariDipilih.toLowerCase() === "semua";
  const hari = tanpaHari ? "" : hariDipilih;

  const [poliList, dokterList] = await Promise.all([
    getPoliList(),
    getDokterList({ q: q || undefined, poli: poli || undefined, hari: hari || undefined }),
  ]);

  const poliNama = poliList.find((p) => p.id_poli === poli)?.nama_poli;

  /** Bangun URL filter dengan mempertahankan kata kunci & poliklinik. */
  const tautan = (hariBaru: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (poli) p.set("poli", poli);
    if (hariBaru) p.set("hari", hariBaru);
    const s = p.toString();
    return s ? `/dokter?${s}` : "/dokter";
  };

  return (
    <>
      <PageHeader
        eyebrow={t(lang, "nav./dokter")}
        title={t(lang, "hal.dokter.judul")}
        description={`${t(lang, "hal.dokter.isi")} (${namaHari(lang, hariIni)})`}
        crumbs={[{ label: t(lang, "nav./dokter") }]}
      />

      <section className="container-page py-8">
        <form className="grid gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)] md:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <label htmlFor="q" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t(lang, "hal.dokter.nama")}
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={t(lang, "hal.dokter.namaPlaceholder")}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700"
            />
          </div>

          <div>
            <label htmlFor="poli" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t(lang, "hal.dokter.poli")}
            </label>
            <select
              id="poli"
              name="poli"
              defaultValue={poli}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700 md:w-56"
            >
              <option value="">{t(lang, "hal.dokter.semuaPoli")}</option>
              {poliList.map((p) => (
                <option key={p.id_poli} value={p.id_poli}>
                  {p.nama_poli}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hari" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t(lang, "hal.dokter.hari")}
            </label>
            <select
              id="hari"
              name="hari"
              defaultValue={tanpaHari ? "semua" : hari}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700 md:w-40"
            >
              <option value="semua">{t(lang, "hal.dokter.semuaHari")}</option>
              {HARI_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h === hariIni ? `${namaHari(lang, h)} (${lang === "en" ? "today" : "hari ini"})` : namaHari(lang, h)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="h-[42px] rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              {t(lang, "umum.cari")}
            </button>
            <Link
              href="/dokter?hari=semua"
              className="h-[42px] rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-muted hover:bg-mist"
            >
              {t(lang, "hal.dokter.semua")}
            </Link>
          </div>
        </form>

        {/* pintasan hari */}
        <div className="mt-4 flex flex-wrap gap-2">
          {HARI_OPTIONS.map((h) => {
            const aktif = !tanpaHari && h === hari;
            return (
              <Link
                key={h}
                href={tautan(h)}
                scroll={false}
                aria-current={aktif ? "true" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  aktif
                    ? "border-brand-800 bg-brand-800 text-white"
                    : "border-line bg-white text-ink hover:border-brand/60 hover:text-brand-800"
                }`}
              >
                {namaHari(lang, h)}
                {h === hariIni && (
                  <span className={aktif ? "ml-1 text-white/70" : "ml-1 text-brand-700"}>•</span>
                )}
              </Link>
            );
          })}
          <Link
            href={tautan("semua")}
            scroll={false}
            aria-current={tanpaHari ? "true" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              tanpaHari
                ? "border-brand-800 bg-brand-800 text-white"
                : "border-line bg-white text-ink hover:border-brand/60 hover:text-brand-800"
            }`}
          >
            {t(lang, "hal.dokter.semuaHari")}
          </Link>
        </div>

        <p className="mt-5 text-sm text-muted">
          {t(lang, "hal.dokter.hasil")} <strong className="text-ink">{dokterList.length}</strong> {t(lang, "hal.dokter.dokter")}
          {poliNama && (
            <>
              {" "}di <strong className="text-ink">{poliNama}</strong>
            </>
          )}
          {hari ? (
            <>
              {" "}· hari <strong className="text-ink">{hari}</strong>
              {hari === hariIni && (
                <span className="ml-1 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                  hari ini
                </span>
              )}
            </>
          ) : (
            <> {" "}· semua hari</>
          )}
          {q && (
            <>
              {" "}· kata kunci “<strong className="text-ink">{q}</strong>”
            </>
          )}
        </p>

        {dokterList.length === 0 ? (
          <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-line bg-mist p-8 text-center">
            <p className="text-sm font-semibold text-brand-900">
              {hari === hariIni ? "Tidak ada dokter praktik hari ini" : "Dokter tidak ditemukan"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {hari === hariIni
                ? "Coba lihat semua hari, atau ubah poliklinik dan kata kunci."
                : "Coba ubah kata kunci, poliklinik, atau hari praktik."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {hari === hariIni && (
                <Link
                  href={tautan("semua")}
                  className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white"
                >
                  Lihat semua hari
                </Link>
              )}
              <Link
                href="/dokter?hari=semua"
                className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-brand-900"
              >
                Tampilkan semua dokter
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dokterList.map((d) => (
              <DoctorCard key={d.id_dokter} dokter={d} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
