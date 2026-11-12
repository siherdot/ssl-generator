import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { bacaBahasa } from "@/lib/i18n-server";
import { tx } from "@/lib/teks-en";
import { getGrupRs, gambar } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  return {
    title: tx(lang, "Rumah Sakit Kami"),
    description:
      lang === "en"
        ? `The Bidadari Group hospital network in North Sumatra and Aceh.`
        : `Jaringan rumah sakit Bidadari Group di Sumatera Utara dan Aceh.`,
  };
}

export const dynamic = "force-dynamic";

/** Inisial nama rumah sakit untuk kartu yang belum punya foto. */
function inisial(nama: string) {
  return nama
    .replace(/^(RSU|RS|Rumah Sakit Umum)\s+/i, "")
    .split(/\s+/)
    .filter((k) => /^[A-Za-z]/.test(k))
    .slice(0, 2)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

export default async function RumahSakitKamiPage() {
  const lang = await bacaBahasa();
  const daftar = await getGrupRs();

  return (
    <>
      <PageHeader
        eyebrow={tx(lang, "Jaringan")}
        title={tx(lang, "Rumah Sakit Kami")}
        description={tx(lang, "Bidadari Group mengelola beberapa rumah sakit di Sumatera Utara dan Aceh. Pilih rumah sakit untuk melihat situs resminya.")}
        crumbs={[{ label: tx(lang, "Rumah Sakit Kami") }]}
      />

      <section className="container-page py-8">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((rs) => {
            const internal = rs.url === "/";
            const ada = rs.url !== "";

            const isi = (
              <>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
                  {rs.foto ? (
                    <>
                      <Image
                        src={gambar(rs.foto)}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="scale-110 object-cover opacity-70 blur-lg"
                      />
                      <div className="absolute inset-0 bg-brand-900/10" aria-hidden />
                      <Image
                        src={gambar(rs.foto)}
                        alt={rs.nama}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="z-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-lg font-bold tracking-wide text-white">
                        {inisial(rs.nama)}
                      </span>
                    </div>
                  )}

                  <span className="absolute left-3 top-3 z-20 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-900">
                    {internal ? tx(lang, "Situs ini") : ada ? tx(lang, "Situs resmi") : tx(lang, "Segera")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="text-sm font-semibold leading-snug text-brand-900">{rs.nama}</span>
                  <span className="mt-1 block text-xs text-muted">{rs.kota}</span>
                  <span className="mt-3 text-xs font-semibold text-brand-800">
                    {internal ? tx(lang, "Anda sedang di sini") : ada ? tx(lang, "Buka situs ↗") : tx(lang, "Tautan belum tersedia")}
                  </span>
                </div>
              </>
            );

            const kelas =
              "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-card)]";

            return (
              <li key={rs.id}>
                {internal ? (
                  <Link href="/" className={`${kelas} card-hover border-brand/50`}>
                    {isi}
                  </Link>
                ) : ada ? (
                  <a
                    href={rs.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${kelas} card-hover border-line`}
                  >
                    {isi}
                  </a>
                ) : (
                  <div className={`${kelas} border-dashed border-line bg-mist`}>{isi}</div>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs text-muted">
          Foto dan tautan tiap rumah sakit bisa diperbarui lewat dashboard admin pada menu
          <strong className="text-ink"> Rumah Sakit Grup</strong>.
        </p>
      </section>
    </>
  );
}
