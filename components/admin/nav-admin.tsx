"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string; badge?: number };

export default function NavAdmin({
  konten,
  pesan,
  pengaturan,
}: {
  konten: Item[];
  pesan: Item[];
  pengaturan: Item[];
}) {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);

  const aktif = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const Grup = ({ judul, items }: { judul: string; items: Item[] }) => (
    <div className="mb-5">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{judul}</p>
      <ul className="space-y-0.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              onClick={() => setBuka(false)}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                aktif(i.href) ? "bg-brand-700 font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {i.label}
              {typeof i.badge === "number" && i.badge > 0 && (
                <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold text-brand-900">
                  {i.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
        aria-expanded={buka}
      >
        {buka ? "Tutup" : "Menu"}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-brand-900 p-4 transition-transform lg:translate-x-0 ${
          buka ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/admin" className="mb-6 block px-3">
          <span className="block text-sm font-bold text-white">RSU Mahkota Bidadari</span>
          <span className="block text-[11px] uppercase tracking-wider text-white/50">Dashboard</span>
        </Link>

        <Grup judul="Ringkasan" items={[{ href: "/admin", label: "Dasbor" }]} />
        <Grup judul="Pesan masuk" items={pesan} />
        <Grup judul="Konten situs" items={konten} />
        <Grup judul="Pengaturan" items={pengaturan} />
      </aside>
    </>
  );
}
