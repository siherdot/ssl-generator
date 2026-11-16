"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Popup promo di beranda.
 *
 * - hanya dirender server bila ada promo aktif bertanda `popup` (lihat getPromoPopup)
 * - sekali per sesi: kunci di sessionStorage berisi id promo, jadi promo baru
 *   (id berbeda) tetap muncul pada kunjungan berikutnya
 * - bisa ditutup lewat tombol, klik latar, atau Esc
 *
 * Animasi ditulis sebagai CSS biasa di dalam komponen: utilitas `transition-*`
 * Tailwind tidak ikut ter-build di proyek ini, sehingga efek hover akan
 * melompat tanpa transisi bila hanya memakai kelas.
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
        @keyframes promoRedup { from { opacity: 0 } to { opacity: 1 } }
        @keyframes promoNaik {
          from { opacity: 0; transform: translateY(22px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .promo-latar { animation: promoRedup .22s ease-out both; }
        .promo-kartu { animation: promoNaik .36s cubic-bezier(.22,1,.36,1) both; }

        .promo-tutup {
          transition: background-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }
        .promo-tutup .promo-x {
          transition: rotate .3s cubic-bezier(.34,1.56,.64,1), scale .3s cubic-bezier(.34,1.56,.64,1);
        }
        .promo-tutup:hover { background-color: #fff; box-shadow: 0 10px 22px -8px rgba(0,0,0,.45); }
        .promo-tutup:hover .promo-x,
        .promo-tutup:focus-visible .promo-x { rotate: 90deg; scale: 1.12; }
        .promo-tutup:active { transform: scale(.9); }
        .promo-tutup:active .promo-x { rotate: 90deg; scale: .95; }

        .promo-cta { transition: background-color .25s ease, transform .2s ease; }
        .promo-cta:hover { background-color: var(--color-brand-700); }
        .promo-cta:active { transform: translateY(1px); }

        .promo-batal { transition: background-color .2s ease, color .2s ease; }
        .promo-batal:hover { background-color: var(--color-mist); color: var(--color-ink); }

        @media (prefers-reduced-motion: reduce) {
          .promo-latar, .promo-kartu { animation: none; }
          .promo-tutup, .promo-tutup .promo-x, .promo-cta, .promo-batal { transition: none; }
        }
      `}</style>

      <div
        className="promo-kartu relative w-full max-w-[26rem] overflow-hidden rounded-[1.35rem] bg-white shadow-[0_28px_70px_-18px_rgba(0,0,0,.55)] ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-brand" aria-hidden="true" />

        <button
          ref={tombolRef}
          type="button"
          onClick={tutup}
          aria-label={labelTutup}
          className="promo-tutup absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/95 ring-1 ring-black/10 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
            className="promo-x h-[18px] w-[18px] text-ink"
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
              className="mx-auto block h-56 w-full rounded-xl bg-mist object-contain"
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
                className="promo-cta inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {labelCta}
                <span aria-hidden="true">›</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={tutup}
              className="promo-batal rounded-xl px-4 py-2.5 text-sm font-semibold text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {labelTutup}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
