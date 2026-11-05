"use client";

import { useActionState } from "react";
import { aksiGantiPassword, type HasilAksi } from "@/app/admin/actions";

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function PasswordForm() {
  const [hasil, aksi, sedang] = useActionState<HasilAksi, FormData>(aksiGantiPassword, null);

  return (
    <form action={aksi} className="space-y-4">
      <div>
        <label htmlFor="lama" className={label}>Password sekarang</label>
        <input id="lama" name="lama" type="password" required autoComplete="current-password" className={input} />
      </div>
      <div>
        <label htmlFor="baru" className={label}>Password baru (minimal 10 karakter)</label>
        <input id="baru" name="baru" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </div>
      <div>
        <label htmlFor="ulangi" className={label}>Ulangi password baru</label>
        <input id="ulangi" name="ulangi" type="password" required minLength={10} autoComplete="new-password" className={input} />
      </div>

      {hasil?.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{hasil.error}</p>}
      {hasil?.sukses && <p className="rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand-900">{hasil.sukses}</p>}

      <button
        type="submit"
        disabled={sedang}
        className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {sedang ? "Menyimpan…" : "Ganti password"}
      </button>
    </form>
  );
}
