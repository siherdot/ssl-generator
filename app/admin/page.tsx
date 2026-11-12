import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/admin/shell";
import { one } from "@/lib/db";
import { wajibLogin } from "@/lib/admin/auth";
import { boleh } from "@/lib/admin/akses";

export const metadata: Metadata = { title: "Dasbor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Ringkas = {
  dokter: number;
  poli: number;
  berita: number;
  fasilitas: number;
  penjamin: number;
  promo: number;
  testimoni: number;
  karier: number;
};

export default async function DasborPage() {
  const admin = await wajibLogin();
  const bisaKonten = boleh(admin.role, "konten");
  const bisaPesan = boleh(admin.role, "pesan");

  const r = await one<Ringkas>(`
    SELECT (SELECT COUNT(*) FROM dokter) AS dokter,
           (SELECT COUNT(*) FROM poli) AS poli,
           (SELECT COUNT(*) FROM news) AS berita,
           (SELECT COUNT(*) FROM facility) AS fasilitas,
           (SELECT COUNT(*) FROM penjamin) AS penjamin,
           (SELECT COUNT(*) FROM promo WHERE aktif = 1) AS promo,
           (SELECT COUNT(*) FROM testimoni WHERE tampil = 1) AS testimoni,
           (SELECT COUNT(*) FROM karier WHERE aktif = 1) AS karier
  `);

  const kartu = [
    { label: "Dokter", nilai: r?.dokter ?? 0, href: "/admin/konten/dokter" },
    { label: "Poliklinik", nilai: r?.poli ?? 0, href: "/admin/konten/poliklinik" },
    { label: "Berita", nilai: r?.berita ?? 0, href: "/admin/konten/berita" },
    { label: "Fasilitas", nilai: r?.fasilitas ?? 0, href: "/admin/konten/fasilitas" },
    { label: "Penjamin", nilai: r?.penjamin ?? 0, href: "/admin/konten/penjamin" },
    { label: "Promo aktif", nilai: r?.promo ?? 0, href: "/admin/konten/promo" },
    { label: "Testimoni tampil", nilai: r?.testimoni ?? 0, href: "/admin/konten/testimoni" },
    { label: "Lowongan aktif", nilai: r?.karier ?? 0, href: "/admin/konten/karier" },
  ];

  return (
    <Shell>
      <h1 className="text-xl font-bold text-brand-900">Dasbor</h1>
      <p className="mt-1 text-sm text-muted">
        Ringkasan isi situs dan aktivitas terbaru. Angka di bawah dihitung langsung dari database.
      </p>

      {bisaKonten ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kartu.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)] hover:border-brand/60"
            >
              <p className="text-2xl font-bold text-brand-900">{k.nilai}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{k.label}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted">
            Akun Anda punya akses <strong className="text-brand-900">pesan masuk</strong> saja.
            Buka menu di samping untuk melihat lamaran kerja dan survei kepuasan pasien.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {bisaKonten && (
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-brand-900">Pintasan</h2>
          <ul className="mt-3 grid gap-2">
            <li>
              <Link href="/admin/konten/berita/baru" className="block rounded-lg bg-mist px-3 py-2 text-sm hover:bg-brand/10">
                + Tulis berita baru
              </Link>
            </li>
            <li>
              <Link href="/admin/konten/promo/baru" className="block rounded-lg bg-mist px-3 py-2 text-sm hover:bg-brand/10">
                + Tambah promo
              </Link>
            </li>
            <li>
              <Link href="/admin/konten/karier/baru" className="block rounded-lg bg-mist px-3 py-2 text-sm hover:bg-brand/10">
                + Buka lowongan
              </Link>
            </li>
            <li>
              <Link href="/admin/konten/profil" className="block rounded-lg bg-mist px-3 py-2 text-sm hover:bg-brand/10">
                Ubah profil &amp; kontak rumah sakit
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-muted">
            Data yang diubah di sini langsung tampil di situs publik (halaman dimuat ulang setiap
            kunjungan).
          </p>
        </div>
        )}
      </div>
    </Shell>
  );
}
