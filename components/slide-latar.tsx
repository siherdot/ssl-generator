"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const JEDA_MS = 6000;

/**
 * Latar foto berputar (slide) di belakang teks hero.
 * Satu foto tampil pada satu waktu dengan transisi pudar; di atasnya
 * diletakkan lapisan hijau agar teks putih tetap terbaca.
 */
export default function SlideLatar({ foto }: { foto: string[] }) {
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    if (foto.length < 2) return;
    const timer = setInterval(() => setAktif((n) => (n + 1) % foto.length), JEDA_MS);
    return () => clearInterval(timer);
  }, [foto.length]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {foto.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === aktif ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* lapisan gelap rata (tanpa gradasi): cukup untuk membuat teks putih terbaca */}
      <div className="absolute inset-0 bg-[#062c0c]/45" />
    </div>
  );
}
