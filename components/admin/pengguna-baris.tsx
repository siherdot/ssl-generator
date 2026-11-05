"use client";

import { useActionState, useState } from "react";
import {
  aksiHapusPengguna,
  aksiResetPasswordPengguna,
  aksiToggleAktif,
  aksiUbahPeran,
  type HasilAksi,
} from "@/app/admin/actions";
import { daftarPeran } from "@/lib/admin/akses";

const input = "w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand-700";

export default function BarisPengguna({
  id,
  peran,
  aktif,
  diriSendiri,
}: {
  id: number;
  peran: string;
  aktif: number;
  diriSendiri: boolean;
}) {
  const [hasil, aksiReset, sedang] = useActionState<HasilAksi, FormData>(aksiResetPasswordPengguna, null);
  const [bukaReset, setBukaReset] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* ubah hak akses */}
        <form action={aksiUbahPeran} className="flex items-center gap-1">
          <input type="hidden" name="id" value={id} />
          <select
            name="peran"
            defaultValue={peran}
            className="rounded-lg border border-line px-2 py-1.5 text-xs"
            aria-label="Hak akses"
          >
            {daftarPeran().map((p) => (
              <option key={p.nilai} value={p.nilai}>{p.label}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-brand-900 hover:bg-mist">
            Simpan
          </button>
        </form>

        <button
          type="button"
          onClick={() => setBukaReset((v) => !v)}
          className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-brand-900 hover:bg-mist"
        >
          {bukaReset ? "Tutup" : "Reset password"}
        </button>

        {!diriSendiri && (
          <>
            <form action={aksiToggleAktif}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-muted hover:bg-mist"
              >
                {aktif === 1 ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </form>

            <form action={aksiHapusPengguna}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm("Hapus pengguna ini? Tindakan ini permanen.")) e.preventDefault();
                }}
                className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                Hapus
              </button>
            </form>
          </>
        )}
      </div>

      {bukaReset && (
        <form action={aksiReset} className="grid gap-2 rounded-lg bg-mist p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="id" value={id} />
          <input name="password" type="password" required minLength={10} placeholder="Password baru" className={input} autoComplete="new-password" />
          <input name="ulangi" type="password" required minLength={10} placeholder="Ulangi password" className={input} autoComplete="new-password" />
          <button
            type="submit"
            disabled={sedang}
            className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            Set
          </button>
          {hasil?.error && <p className="text-xs text-red-700 sm:col-span-3">{hasil.error}</p>}
          {hasil?.sukses && <p className="text-xs text-brand-900 sm:col-span-3">{hasil.sukses}</p>}
        </form>
      )}
    </div>
  );
}
