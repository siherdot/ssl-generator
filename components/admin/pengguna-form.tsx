"use client";

import { useActionState } from "react";
import { aksiTambahPengguna, type HasilAksi } from "@/app/admin/actions";
import { daftarPeran, peranKeterangan } from "@/lib/admin/akses";

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function PenggunaForm() {
  const [hasil, aksi, sedang] = useActionState<HasilAksi, FormData>(aksiTambahPengguna, null);

  return (
    <form action={aksi} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-sm font-semibold text-brand-900">Tambah pengguna</h2>
      <p className="mt-1 text-xs text-muted">
        Berikan akun terpisah untuk tiap petugas supaya jejak perubahan lebih jelas.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="username" className={label}>Username</label>
          <input id="username" name="username" required autoComplete="off" className={input} placeholder="mis. petugas.pendaftaran" />
        </div>
        <div>
          <label htmlFor="nama" className={label}>Nama lengkap</label>
          <input id="nama" name="nama" className={input} placeholder="mis. Siti Aminah" />
        </div>
        <div>
          <label htmlFor="peran" className={label}>Hak akses</label>
          <select id="peran" name="peran" defaultValue="editor" className={input}>
            {daftarPeran().map((p) => (
              <option key={p.nilai} value={p.nilai}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="password" className={label}>Password (min 10 karakter)</label>
          <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </div>
        <div>
          <label htmlFor="ulangi" className={label}>Ulangi password</label>
          <input id="ulangi" name="ulangi" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </div>
      </div>

      <ul className="mt-3 space-y-1 rounded-lg bg-mist p-3 text-[11px] text-muted">
        {daftarPeran().map((p) => (
          <li key={p.nilai}>
            <strong className="text-brand-900">{p.label}</strong> — {peranKeterangan[p.nilai]}
          </li>
        ))}
      </ul>

      {hasil?.error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{hasil.error}</p>}
      {hasil?.sukses && <p className="mt-3 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">{hasil.sukses}</p>}

      <button
        type="submit"
        disabled={sedang}
        className="mt-4 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {sedang ? "Menyimpan…" : "Tambah pengguna"}
      </button>
    </form>
  );
}
