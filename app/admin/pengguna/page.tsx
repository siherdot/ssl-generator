import type { Metadata } from "next";
import Shell from "@/components/admin/shell";
import PenggunaForm from "@/components/admin/pengguna-form";
import BarisPengguna from "@/components/admin/pengguna-baris";
import { wajibAdmin } from "@/lib/admin/auth";
import { peranLabel, type Peran } from "@/lib/admin/akses";
import { rows } from "@/lib/db";
import { tanggalWaktu } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Pengguna & Hak Akses", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ ubah?: string; hapus?: string; tolak?: string }>;

type Baris = {
  id: number;
  username: string;
  nama: string;
  role: string;
  aktif: number;
  terakhir_login: string | null;
  dibuat: string | null;
};

const pesanTolak: Record<string, string> = {
  "diri-sendiri": "Tidak bisa menonaktifkan atau menghapus akun yang sedang dipakai.",
  "admin-terakhir": "Harus selalu ada minimal satu admin yang aktif.",
};

export default async function PenggunaPage({ searchParams }: { searchParams: SearchParams }) {
  const saya = await wajibAdmin();
  const sp = await searchParams;

  const data = await rows<Baris>(
    `SELECT id, username, nama, role, aktif, terakhir_login, dibuat
       FROM admin_user ORDER BY (role = 'admin') DESC, username`
  );

  return (
    <Shell>
      <h1 className="text-xl font-bold text-brand-900">Pengguna &amp; Hak Akses</h1>
      <p className="mt-1 text-sm text-muted">
        Kelola akun petugas yang boleh masuk dashboard. Setiap orang sebaiknya punya akun sendiri.
      </p>

      {sp.ubah && <p className="mt-4 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">Perubahan tersimpan.</p>}
      {sp.hapus && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Pengguna dihapus.</p>}
      {sp.tolak && (
        <p className="mt-4 rounded-lg bg-sun/25 px-4 py-2 text-sm text-brand-900">
          {pesanTolak[sp.tolak] ?? "Tindakan tidak diizinkan."}
        </p>
      )}

      <div className="mt-5 space-y-5">
        <PenggunaForm />

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-mist text-left text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Nama / username</th>
                <th className="px-4 py-3">Hak akses</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Login terakhir</th>
                <th className="px-4 py-3 text-right">Kelola</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Belum ada pengguna.
                  </td>
                </tr>
              )}
              {data.map((u) => (
                <tr key={u.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink">
                      {u.nama || "—"}
                      {u.id === saya.id && (
                        <span className="ml-2 rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-900">
                          kamu
                        </span>
                      )}
                    </span>
                    <span className="block font-mono text-[11px] text-muted">{u.username}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink">{peranLabel[u.role as Peran] ?? u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        u.aktif === 1 ? "bg-brand/20 text-brand-900" : "bg-mist text-muted"
                      }`}
                    >
                      {u.aktif === 1 ? "aktif" : "nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{tanggalWaktu(u.terakhir_login)}</td>
                  <td className="px-4 py-3">
                    <BarisPengguna id={u.id} peran={u.role} aktif={u.aktif} diriSendiri={u.id === saya.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-mist p-5 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-brand-900">Catatan hak akses</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Admin</strong> — semua menu, termasuk mengelola pengguna.</li>
            <li><strong>Editor</strong> — konten situs + pesan masuk, tanpa kelola pengguna.</li>
            <li><strong>Operator</strong> — hanya pesan masuk (pendaftaran, lamaran, kontak).</li>
            <li>Akun tidak bisa menghapus/menonaktifkan dirinya sendiri, dan admin aktif terakhir tidak bisa dihapus.</li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
