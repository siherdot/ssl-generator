"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KUKI_BAHASA, type Lang } from "@/lib/i18n";

/**
 * Tombol ID | EN. Pilihan disimpan di cookie 1 tahun lalu halaman dimuat ulang
 * di server, jadi seluruh teks antarmuka berganti tanpa perlu alamat /en.
 */
export default function PemilihBahasa({ lang, gelap = false }: { lang: Lang; gelap?: boolean }) {
  const router = useRouter();
  const [aktif, setAktif] = useState<Lang>(lang);
  const [pending, mulai] = useTransition();

  const pilih = (baru: Lang) => {
    if (baru === aktif) return;
    setAktif(baru);
    document.cookie = `${KUKI_BAHASA}=${baru};path=/;max-age=31536000;SameSite=Lax`;
    mulai(() => router.refresh());
  };

  const dasar =
    "rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors";
  const biasa = gelap ? "text-white/70 hover:text-white" : "text-muted hover:text-brand-800";
  const terpilih = gelap ? "bg-white text-brand-900" : "bg-brand-800 text-white";

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border p-0.5 ${
        gelap ? "border-white/25" : "border-line"
      }`}
      role="group"
      aria-label="Bahasa / Language"
      aria-busy={pending}
    >
      {(["id", "en"] as Lang[]).map((kode) => (
        <button
          key={kode}
          type="button"
          onClick={() => pilih(kode)}
          aria-pressed={aktif === kode}
          className={`${dasar} ${aktif === kode ? terpilih : biasa}`}
        >
          {kode.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
