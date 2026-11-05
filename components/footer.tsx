import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-800 text-white/80">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-base font-bold text-white">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{site.address}</p>
          <p className="mt-4 text-sm">
            <span className="block text-white/60">IGD 24 Jam</span>
            <a href={`tel:${site.igd.replace(/[^0-9+]/g, "")}`} className="font-semibold text-white hover:text-brand-700">
              {site.igd}
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Untuk Pengunjung</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/dokter" className="hover:text-brand-700">Cari Dokter</Link></li>
            <li><Link href="/layanan/poliklinik" className="hover:text-brand-700">Poliklinik</Link></li>
            <li><Link href="/layanan/rawat-inap" className="hover:text-brand-700">Rawat Inap</Link></li>
            <li><Link href="/informasi/ketersediaan-kamar" className="hover:text-brand-700">Ketersediaan Kamar</Link></li>
            <li><Link href="/informasi/alur-pendaftaran" className="hover:text-brand-700">Alur Pendaftaran</Link></li>
            <li><Link href="/informasi/asuransi" className="hover:text-brand-700">Asuransi &amp; Penjamin</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Tentang</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/tentang" className="hover:text-brand-700">Profil Rumah Sakit</Link></li>
            <li><Link href="/tentang#visi-misi" className="hover:text-brand-700">Visi &amp; Misi</Link></li>
            <li><Link href="/fasilitas" className="hover:text-brand-700">Fasilitas</Link></li>
            <li><Link href="/informasi/berita" className="hover:text-brand-700">Berita</Link></li>
            <li><Link href="/informasi/karier" className="hover:text-brand-700">Karier</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Kontak</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
                WhatsApp {site.whatsappLabel}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-brand-700">
                Telepon {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-brand-700">
                {site.email}
              </a>
            </li>
            <li><Link href="/kontak" className="hover:text-brand-700">Survei Kepuasan</Link></li>
            <li>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-700"
              >
                Lihat di Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-white/50">Kesehatan Anda Merupakan Prioritas Utama Kami</p>
        </div>
      </div>
    </footer>
  );
}
