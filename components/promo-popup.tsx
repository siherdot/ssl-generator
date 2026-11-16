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
  namaSitus = "RSU Mahkota Bidadari",
  labelTutup = "Tutup",
  labelCta = "Lihat detail",
  jeda = 1200,
}: {
  id: number;
  judul: string;
  deskripsi?: string;
  gambar?: string;
  link?: string;
  namaSitus?: string;
  labelTutup?: string;
  labelCta?: string;
  jeda?: number;
}) {
  const kunci = `promo-popup:v1:${id}`;
  const [buka, setBuka] = useState(false);
  const [hoverTutup, setHoverTutup] = useState(false);
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

  return (
    <div
      className="promo-latar fixed inset-0 z-[70] flex items-end justify-center bg-black/55 px-4 pb-4 pt-10 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`promo-judul-${id}`}
      onClick={tutup}
    >
      <style>{`
        @keyframes promoNaik {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes promoRedup {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .promo-latar { animation: promoRedup .22s ease-out both; }
        .promo-kartu { animation: promoNaik .34s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .promo-latar, .promo-kartu { animation: none; }
          .promo-tutup svg { transition: none !important; }
        }
      `}</style>

      <div
        className="promo-kartu relative w-full max-w-[26rem] overflow-hidden rounded-[1.35rem] bg-white shadow-[0_28px_70px_-18px_rgba(0,0,0,.55)] ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-brand" aria-hidden="true" />

        {/* tombol tutup: berputar 90 derajat saat disentuh kursor */}
        <button
          ref={tombolRef}
          type="button"
          onClick={tutup}
          onMouseEnter={() => setHoverTutup(true)}
          onMouseLeave={() => setHoverTutup(false)}
          aria-label={labelTutup}
          className="promo-tutup absolute right-3 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/95 ring-1 ring-black/10 backdrop-blur transition-[box-shadow,transform,background-color] duration-300 ease-out hover:bg-white hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,.5)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
            className={`h-[18px] w-[18px] text-ink transition-transform duration-300 ease-out ${
              hoverTutup ? "rotate-90 scale-110" : "rotate-0 scale-100"
            }`}
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex items-center gap-2 px-5 pb-1 pt-5">
          <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Promo
          </span>
          <span className="text-[11px] font-medium text-muted">{namaSitus}</span>
        </div>

        {gambar ? (
          <div className="px-3 pt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambar}
              alt=""
              className="mx-auto max-h-56 w-full rounded-xl bg-mist object-contain"
              loading="eager"
            />
          </div>
        ) : null}

        <div className="px-5 pb-5 pt-4">
          <h2 id={`promo-judul-${id}`} className="text-[1.05rem] font-bold leading-snug text-ink">
            {judul}
          </h2>
          {deskripsi ? (
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{deskripsi}</p>
          ) : null}

          <div className="mt-4 flex items-center gap-1.5">
            {link ? (
              <a
                href={link}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {labelCta}
                <span aria-hidden="true">›</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={tutup}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {labelTutup}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
