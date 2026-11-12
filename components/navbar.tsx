"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation, site } from "@/lib/site";

export default function Navbar({ logo = "/images/logo-rsub.png" }: { logo?: string }) {
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /** Kelompokkan anak menu berdasarkan `grup`, urut sesuai kemunculan. */
  const kelompok = (anak: NonNullable<(typeof navigation)[number]["children"]>) => {
    const hasil: { nama: string | null; isi: typeof anak }[] = [];
    for (const c of anak) {
      const nama = c.grup ?? null;
      const ada = hasil.find((g) => g.nama === nama);
      if (ada) ada.isi.push(c);
      else hasil.push({ nama, isi: [c] });
    }
    return hasil;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-4 px-4 lg:h-[72px] lg:gap-6 lg:px-8 2xl:px-12">
        {/* identitas */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.name} — beranda`}>
          <Image
            src={logo}
            alt={`Logo ${site.name}`}
            width={44}
            height={48}
            priority
            className="h-10 w-auto lg:h-11"
          />
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[15px] font-bold text-brand-900">
              {site.name}
            </span>
            <span className="hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:block">
              Langkat · Sumatera Utara
            </span>
          </span>
        </Link>

        {/* menu: menempel ke kanan, tidak melebar penuh */}
        <nav className="ml-auto hidden items-center gap-0 lg:flex" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive(item.href) ? "text-brand-800" : "text-ink hover:text-brand-800"
                }`}
              >
                {item.label}
                {item.children && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </Link>

              {item.children && (
                <div
                  className={`invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-1 rounded-xl border border-line bg-white opacity-0 shadow-[0_16px_40px_rgba(10,107,18,0.14)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
                    item.children.some((c) => c.grup)
                      ? "grid w-[640px] max-w-[calc(100vw-2rem)] grid-cols-3 gap-x-3 gap-y-1 p-4"
                      : "w-72 p-2"
                  }`}
                >
                  {kelompok(item.children).map((g) => (
                    <div key={g.nama ?? "lain"} className="min-w-0">
                      {g.nama && (
                        <p className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800">
                          {g.nama}
                        </p>
                      )}
                      {g.isi.map((child) => {
                        const luar = child.href.startsWith("http");
                        const cls =
                          "block rounded-lg px-3 py-1.5 text-[13px] leading-snug text-ink hover:bg-mist hover:text-brand-800";
                        const isi = (
                          <>
                            <span className="block font-medium">
                              {child.label}
                              {luar && <span className="ml-1 text-[10px] text-muted">↗</span>}
                            </span>
                            {child.description && (
                              <span className="block text-[11px] text-muted">{child.description}</span>
                            )}
                          </>
                        );
                        return luar ? (
                          <a
                            key={child.href}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cls}
                          >
                            {isi}
                          </a>
                        ) : (
                          <Link key={child.href} href={child.href} className={cls}>
                            {isi}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* pencarian seperti acuan: kecil di ujung kanan */}
        <form action="/dokter" className="hidden shrink-0 items-center lg:flex">
          <label htmlFor="cari-navbar" className="sr-only">
            Cari dokter
          </label>
          <div className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="cari-navbar"
              name="q"
              type="search"
              placeholder="Cari…"
              className="w-24 bg-transparent text-xs outline-none placeholder:text-muted"
            />
          </div>
        </form>

        <Link
          href="/daftar-online"
          className="hidden shrink-0 whitespace-nowrap rounded-md bg-brand-700 px-3.5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-800 lg:inline-flex"
        >
          Daftar via JKN
        </Link>

        {/* tombol menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="ml-auto rounded-lg border border-line p-2 text-brand-900 lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* menu mobile */}
      {open && (
        <nav id="menu-mobile" className="border-t border-line bg-white lg:hidden" aria-label="Navigasi seluler">
          <div className="w-full px-4 py-3 lg:px-8">
            <form action="/dokter" className="mb-2 flex items-center gap-2 rounded-lg border border-line px-3 py-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                name="q"
                type="search"
                placeholder="Cari dokter…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                aria-label="Cari dokter"
              />
            </form>
          </div>

          <ul className="w-full px-4 pb-2 lg:px-8">
            {navigation.map((item) => (
              <li key={item.href} className="border-b border-line/60">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 py-3 text-sm font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      onClick={() => setOpenSub(openSub === item.href ? null : item.href)}
                      aria-label={`Buka submenu ${item.label}`}
                      aria-expanded={openSub === item.href}
                      className="p-2 text-muted"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d={openSub === item.href ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
                      </svg>
                    </button>
                  )}
                </div>
                {item.children && openSub === item.href && (
                  <div className="pb-3 pl-3">
                    {kelompok(item.children).map((g) => (
                      <div key={g.nama ?? "lain"} className="mt-1">
                        {g.nama && (
                          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800">
                            {g.nama}
                          </p>
                        )}
                        <ul>
                          {g.isi.map((child) =>
                            child.href.startsWith("http") ? (
                              <li key={child.href}>
                                <a
                                  href={child.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block py-1.5 text-sm text-muted"
                                >
                                  {child.label} ↗
                                </a>
                              </li>
                            ) : (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpen(false)}
                                  className="block py-1.5 text-sm text-muted"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className="py-3">
              <Link
                href="/daftar-online"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Daftar via JKN
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
