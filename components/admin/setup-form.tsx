"use client";

import { useActionState } from "react";
import { aksiSetupAdmin, type HasilAksi } from "@/app/admin/actions";

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function SetupForm() {
  const [hasil, aksi, sedang] = useActionState<HasilAksi, FormData>(aksiSetupAdmin, null);

  return (
    <form action={aksi} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className={label}>Username</label>
        <input id="username" name="username" required autoComplete="username" className={input} placeholder="mis. herdi" />
      </div>
      <div>
        <label htmlFor="nama" className={label}>Nama tampilan</label>
        <input id="nama" name="nama" className={input} placeholder="mis. Herdiansyah" />
      </div>
      <div>
        <label htmlFor="password" className={label}>Password (minimal 10 karakter)</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </div>
      <div>
        <label htmlFor="ulangi" className={label}>Ulangi password</label>
        <input id="ulangi" name="ulangi" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </div>

      {hasil?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{hasil.error}</p>
      )}

      <button
        type="submit"
        disabled={sedang}
        className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {sedang ? "Menyimpan…" : "Buat akun admin"}
      </button>
    </form>
  );
}
