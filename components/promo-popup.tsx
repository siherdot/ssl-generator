"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Popup promo di beranda.
 *
 * Aturan tampil:
 * - hanya dirender server bila ada promo aktif bertanda `popup` (lihat getPromoPopup)
 * - muncul sekali per sesi: kunci disimpan di sessionStorage berisi id promo,
 *   jadi menutup popup tidak mengganggu navigasi berikutnya, tetapi promo BARU
 *   (id berbeda) tetap muncul pada kunjungan berikutnya.
 * - bisa ditutup dengan tombol, klik latar, atau tombol Esc.
 */
export default function PromoPopup({
  id,
  judul,
  deskripsi,
  gambar,
  link,
  labelTutup = "Tutup",
  labelCta = "Lihat detail",
  jeda = 1200,
}: {
  id: number;
  judul: string;
  deskripsi?: string;
  gambar?: string;
  link?: string;
  labelTutup?: string;
  labelCta?: string;
  jeda?: number;
}) {
  const kunci = `promo-popup:v1:${id}`;
  const [buka, setBuka] = useState(false);
  const tombolRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let sudah = false;
    try {
      sudah = sessionStorage.getItem(kunci) === "1";
    } catch {
      sudah = false;
    }
    if (sudah) return;
    const t = setTimeout(() => setBuka(true), jeda);
    return () => clearTimeout(t);
  }, [kunci, jeda]);

  useEffect(() => {
    if (!buka) return;
    tombolRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    document.addEventListener("keydown", onKey);
    const lama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = lama;
    };
  }, [buka]);

  function tutup() {
    try {
      sessionStorage.setItem(kunci, "1");
    } catch {
      /* mode privat: cukup tutup tanpa mengingat */
    }
    setBuka(false);
  }

  if (!buka) return null;

  const isi = (
    <>
      {gambar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gambar}
          alt=""
          className="h-40 w-full object-cover sm:h-48"
          loading="eager"
        />
      ) : null}
      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
          Promo
        </p>
        <h2 className="mt-1 text-lg font-bold leading-snug text-ink sm:text-xl">{judul}</h2>
        {deskripsi ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{deskripsi}</p>
        ) : null}
        {link ? (
          <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            {labelCta}
            <span aria-hidden="true">›</span>
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={judul}
      onClick={tutup}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-card)] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={tombolRef}
          type="button"
          onClick={tutup}
          aria-label={labelTutup}
          className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-xl leading-none text-ink shadow ring-1 ring-black/10 hover:bg-white"
        >
          ×
        </button>
        {link ? (
          <a href={link} className="block focus:outline-none">
            {isi}
          </a>
        ) : (
          isi
        )}
      </div>
    </div>
  );
}
