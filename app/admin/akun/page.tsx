import type { Metadata } from "next";
import Shell from "@/components/admin/shell";
import PasswordForm from "@/components/admin/password-form";
import { wajibLogin } from "@/lib/admin/auth";
import { boleh, peranLabel, type Peran } from "@/lib/admin/akses";
import { tanggalWaktu } from "@/lib/admin/format";
import { one } from "@/lib/db";

export const metadata: Metadata = { title: "Akun", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AkunPage() {
  const admin = await wajibLogin();
  const info = await one<{ terakhir_login: string | null; dibuat: string | null }>(
    "SELECT terakhir_login, dibuat FROM admin_user WHERE id = ?",
    [admin.id]
  );
  const bisaKelolaPengguna = boleh(admin.role, "pengguna");

  return (
    <Shell>
      <h1 className="text-xl font-bold text-brand-900">Akun &amp; Password</h1>
      <p className="mt-1 text-sm text-muted">
        Ganti password akun kamu sendiri. Password minimal 10 karakter.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
          <PasswordForm />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-brand-900">Informasi akun</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Username</dt>
                <dd className="font-mono text-ink">{admin.username}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Nama</dt>
                <dd className="text-ink">{admin.nama || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Hak akses</dt>
                <dd className="text-ink">{peranLabel[admin.role as Peran] ?? admin.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Login terakhir</dt>
                <dd className="text-ink">{tanggalWaktu(info?.terakhir_login ?? null)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Password disimpan sebagai hash bcrypt — tidak ada yang bisa membacanya, termasuk
              dari dashboard ini.
            </p>
          </div>

          {bisaKelolaPengguna && (
            <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5">
              <h2 className="text-sm font-semibold text-brand-900">Pengguna lain</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Tambah akun petugas dan atur hak aksesnya: admin (penuh), editor (konten),
                operator (pesan masuk saja).
              </p>
              <a
                href="/admin/pengguna"
                className="mt-3 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
              >
                Pengguna &amp; hak akses
              </a>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}
