import Link from "next/link";
import PetaEmbed from "@/components/peta-embed";
import { site } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";

type IkonNama = "survei" | "pengaduan" | "lapor" | "wbs";

/**
 * Menu survei & pengaduan.
 * "Layanan Pengaduan", "Lapor!", dan "Whistle Blowing System" sengaja
 * disembunyikan dulu sampai tautan resminya tersedia — tinggal tambahkan
 * kembali ke array ini beserta ikonnya.
 */
const menu: { label: string; ket: string; href: string; ikon: IkonNama }[] = [
  {
    label: "Survei Kepuasan",
    ket: "Penyampaian kritik dan saran",
    href: "/kontak",
    ikon: "survei",
  },
];

function Ikon({ nama }: { nama: IkonNama }) {
  const dasar = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (nama === "survei")
    return (
      <svg {...dasar}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  if (nama === "pengaduan")
    return (
      <svg {...dasar}>
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  if (nama === "lapor")
    return (
      <svg {...dasar}>
        <path d="m3 11 18-7-7 18-2.5-7.5L3 11Z" />
      </svg>
    );
  return (
    <svg {...dasar}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

export default function HubungiKami({ lang = "id" }: { lang?: Lang }) {

  return (
    <section className="border-t border-line bg-mint/40 py-12" aria-labelledby="hubungi-kami">
      <div className="container-page">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">
          {t(lang, "hub.label")}
        </p>
        <h2 id="hubungi-kami" className="section-title mt-2 text-2xl lg:text-3xl">
          {t(lang, "hub.judul")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          {t(lang, "hub.isi")}
        </p>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          {/* kiri: peta lokasi */}
          <PetaEmbed judul={`Peta lokasi ${site.name}`} tinggi="h-[300px] lg:h-[420px]" />

          {/* kanan: daftar survei & pengaduan */}
          <div className="flex h-full flex-col justify-center rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">
              {t(lang, "hub.surveiJudul")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {t(lang, "hub.surveiIsi")}
            </p>

          <ul className="mt-4">
            {menu.map((m) => {
              const dalam = m.href.startsWith("/");
              const kelas =
                "group flex items-center gap-4 rounded-lg border border-line px-4 py-4 transition-colors hover:bg-mist hover:border-brand/60";
              const isiMenu = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-800">
                    <Ikon nama={m.ikon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-brand-900 group-hover:text-brand-800">
                      {m.href === "/kontak" ? t(lang, "hub.surveiNama") : m.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted">{m.href === "/kontak" ? t(lang, "hub.surveiKet") : m.ket}</span>
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-brand-700 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </>
              );

              return (
                <li key={m.label}>
                  {dalam ? (
                    <Link href={m.href} className={kelas}>
                      {isiMenu}
                    </Link>
                  ) : (
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={kelas}
                    >
                      {isiMenu}
                    </a>
                  )}
                </li>
              );
            })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
