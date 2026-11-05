import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SetupForm from "@/components/admin/setup-form";
import { adaAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Buat Akun Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // halaman ini hanya bisa dipakai sekali, saat belum ada admin
  if (await adaAdmin()) redirect("/admin/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-800">Langkah awal</p>
        <h1 className="mt-1 text-xl font-bold text-brand-900">Buat akun admin</h1>
        <p className="mt-1 text-sm text-muted">
          Akun ini dipakai untuk mengelola berita, dokter, jadwal, promo, dan pesan masuk.
          Password disimpan terenkripsi (bcrypt), bukan teks biasa.
        </p>

        <SetupForm />

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:underline">
            ← Kembali ke situs
          </Link>
        </p>
      </div>
    </div>
  );
}
