import Link from "next/link";
import { site } from "@/lib/site";
import { navLabel, t, type Lang } from "@/lib/i18n";

export default function Footer({ lang = "id" }: { lang?: Lang }) {
  return (
    <footer className="mt-16 bg-brand-800 text-white/80">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-base font-bold text-white">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{site.address}</p>
          <p className="mt-4 text-sm">
            <span className="block text-white/60">{t(lang, "umum.igd")}</span>
            <a href={`tel:${site.igd.replace(/[^0-9+]/g, "")}`} className="font-semibold text-white hover:text-brand-700">
              {site.igd}
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">{t(lang, "footer.pengunjung")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/dokter" className="hover:text-brand-700">{navLabel(lang, "/dokter", "Cari Dokter")}</Link></li>
            <li><Link href="/layanan/poliklinik" className="hover:text-brand-700">{navLabel(lang, "/layanan/poliklinik", "Poliklinik")}</Link></li>
            <li><Link href="/layanan/rawat-inap" className="hover:text-brand-700">{navLabel(lang, "/layanan/rawat-inap", "Rawat Inap")}</Link></li>
            <li><Link href="/informasi/ketersediaan-kamar" className="hover:text-brand-700">{navLabel(lang, "/informasi/ketersediaan-kamar", "Ketersediaan Kamar")}</Link></li>
            <li><Link href="/informasi/alur-pendaftaran" className="hover:text-brand-700">{navLabel(lang, "/informasi/alur-pendaftaran", "Alur Pendaftaran")}</Link></li>
            <li><Link href="/informasi/asuransi" className="hover:text-brand-700">{navLabel(lang, "/informasi/asuransi", "Asuransi &amp; Penjamin")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">{t(lang, "footer.tentang")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/tentang" className="hover:text-brand-700">{navLabel(lang, "/tentang", "Profil Rumah Sakit")}</Link></li>
            <li><Link href="/tentang#visi-misi" className="hover:text-brand-700">{navLabel(lang, "/tentang#visi-misi", "Visi &amp; Misi")}</Link></li>
            <li><Link href="/fasilitas" className="hover:text-brand-700">{navLabel(lang, "/fasilitas", "Fasilitas")}</Link></li>
            <li><Link href="/informasi/berita" className="hover:text-brand-700">{navLabel(lang, "/informasi/berita", "Berita")}</Link></li>
            <li><Link href="/informasi/karier" className="hover:text-brand-700">{navLabel(lang, "/informasi/karier", "Karier")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">{t(lang, "footer.kontak")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
                WhatsApp {site.whatsappLabel}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-brand-700">
                {t(lang, "footer.telepon")} {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-brand-700">
                {site.email}
              </a>
            </li>
            <li><Link href="/kontak" className="hover:text-brand-700">{t(lang, "footer.survei")}</Link></li>
            <li>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-700"
              >
                {t(lang, "footer.maps")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. {t(lang, "footer.hak")}</p>
          <p className="text-white/50">{t(lang, "footer.slogan")}</p>
        </div>
      </div>
    </footer>
  );
}
