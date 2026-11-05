"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Carousel geser horizontal (scroll-snap) tanpa dependensi.
 * Panah muncul di layar lebar; di layar sentuh cukup digeser.
 */
export default function Carousel({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [bisaKiri, setBisaKiri] = useState(false);
  const [bisaKanan, setBisaKanan] = useState(true);
  const [berhenti, setBerhenti] = useState(false);

  const perbarui = () => {
    const el = ref.current;
    if (!el) return;
    setBisaKiri(el.scrollLeft > 8);
    setBisaKanan(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    perbarui();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", perbarui, { passive: true });
    window.addEventListener("resize", perbarui);
    return () => {
      el.removeEventListener("scroll", perbarui);
      window.removeEventListener("resize", perbarui);
    };
  }, []);

  /* geser otomatis: tiap 4,5 detik satu kartu; berhenti saat kursor/fokus/touch */
  useEffect(() => {
    if (berhenti) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const node = ref.current;
      if (!node) return;

      const mentok = node.scrollLeft + node.clientWidth >= node.scrollWidth - 12;
      if (mentok) {
        node.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const kartu = node.querySelector<HTMLElement>(".carousel-item");
      const lebar = kartu ? kartu.offsetWidth + 16 : node.clientWidth * 0.8;
      node.scrollBy({ left: lebar, behavior: "smooth" });
    }, 4500);

    return () => window.clearInterval(timer);
  }, [berhenti]);

  const geser = (arah: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    // geser sebesar 1 kartu (± 85% lebar tampak)
    el.scrollBy({ left: arah * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setBerhenti(true)}
      onMouseLeave={() => setBerhenti(false)}
      onFocusCapture={() => setBerhenti(true)}
      onBlurCapture={() => setBerhenti(false)}
      onTouchStart={() => setBerhenti(true)}
    >
      {/* panah */}
      <div className="pointer-events-none absolute -top-12 right-0 hidden items-center gap-2 lg:flex">
        <button
          type="button"
          onClick={() => geser(-1)}
          disabled={!bisaKiri}
          aria-label={label ? `Geser ${label} ke kiri` : "Geser ke kiri"}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-brand-900 shadow-sm transition-colors hover:bg-mist disabled:opacity-35"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => geser(1)}
          disabled={!bisaKanan}
          aria-label={label ? `Geser ${label} ke kanan` : "Geser ke kanan"}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-brand-900 shadow-sm transition-colors hover:bg-mist disabled:opacity-35"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* rel geser */}
      <div
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 lg:mx-0 lg:px-0"
      >
        {children}
      </div>
    </div>
  );
}
