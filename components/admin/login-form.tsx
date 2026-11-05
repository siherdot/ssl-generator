"use client";

import { useActionState } from "react";
import { aksiMasuk, type HasilAksi } from "@/app/admin/actions";

export default function LoginForm() {
  const [hasil, aksi, sedang] = useActionState<HasilAksi, FormData>(aksiMasuk, null);

  return (
    <form action={aksi} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700"
        />
      </div>

      {hasil?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {hasil.error}
        </p>
      )}

      <button
        type="submit"
        disabled={sedang}
        className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {sedang ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
