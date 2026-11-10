import Link from "next/link";
import { wajibLogin } from "@/lib/admin/auth";
import { boleh, peranLabel, type Peran } from "@/lib/admin/akses";
import { inboxes, resources } from "@/lib/admin/resources";
import { one } from "@/lib/db";
import NavAdmin from "./nav-admin";
import { aksiKeluar } from "@/app/admin/actions";

/** Kerangka dashboard admin. Setiap halaman admin memakai komponen ini. */
export default async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await wajibLogin();

  // hitung pesan yang belum diproses untuk badge
  const badge = async (tabel: string) => {
    const r = await one<{ n: number }>(
      `SELECT COUNT(*) AS n FROM \`${tabel}\` WHERE status = 'baru'`
    );
    return Number(r?.n ?? 0);
  };

  const [pendaftaran, lamaran, survei] = await Promise.all([
    badge("pendaftaran"),
    badge("lamaran"),
    badge("survei").catch(() => 0),
  ]);

  const pesan = [
    { href: "/admin/pesan/pendaftaran", label: "Pendaftaran", badge: pendaftaran },
    { href: "/admin/pesan/lamaran", label: "Lamaran kerja", badge: lamaran },
    { href: "/admin/pesan/survei", label: "Survei kepuasan", badge: survei },
  ];

  const bisaKonten = boleh(admin.role, "konten");
  const bisaPengguna = boleh(admin.role, "pengguna");

  const konten = bisaKonten
    ? resources
        .filter((r) => r.grup === "konten" && !r.tunggal)
        .map((r) => ({ href: `/admin/konten/${r.kunci}`, label: r.label }))
    : [];

  const pengaturan = [
    ...(bisaKonten
      ? resources
          .filter((r) => r.grup === "pengaturan" && r.tunggal)
          .map((r) => ({ href: `/admin/konten/${r.kunci}`, label: r.label }))
      : []),
    { href: "/admin/akun", label: "Akun & password" },
    ...(bisaPengguna ? [{ href: "/admin/pengguna", label: "Pengguna & hak akses" }] : []),
  ];

  return (
    <div className="min-h-screen bg-mist">
      <NavAdmin konten={konten} pesan={pesan} pengaturan={pengaturan} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="pl-12 lg:pl-0">
              <p className="text-[11px] uppercase tracking-wider text-muted">Masuk sebagai</p>
              <p className="text-sm font-semibold text-brand-900">
                {admin.nama || admin.username}
                <span className="ml-2 rounded bg-mist px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">
                  {peranLabel[admin.role as Peran] ?? admin.role}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="hidden rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-mist sm:block"
              >
                Lihat situs ↗
              </Link>
              <form action={aksiKeluar}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
