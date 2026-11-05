import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/login-form";
import { adaAdmin, adminSekarang } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Masuk Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await adminSekarang()) redirect("/admin");
  const sudahAda = await adaAdmin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-800">Dashboard</p>
        <h1 className="mt-1 text-xl font-bold text-brand-900">RSU Mahkota Bidadari</h1>
        <p className="mt-1 text-sm text-muted">Masuk untuk mengelola isi situs.</p>

        {sudahAda ? (
          <LoginForm />
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-brand/60 bg-brand/10 p-4">
            <p className="text-sm font-semibold text-brand-900">Belum ada akun admin</p>
            <p className="mt-1 text-xs text-muted">
              Buat akun pertama dulu. Halaman ini hanya muncul selama tabel admin masih kosong.
            </p>
            <Link
              href="/admin/setup"
              className="mt-3 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Buat akun admin
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:underline">
            ← Kembali ke situs
          </Link>
        </p>
      </div>
    </div>
  );
}
