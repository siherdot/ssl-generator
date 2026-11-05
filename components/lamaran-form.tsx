"use client";

import { useState } from "react";

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function LamaranForm({ posisiList }: { posisiList: string[] }) {
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; kode?: string; pesan?: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKirim(true);
    setHasil(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/lamaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setHasil(json);
      if (json.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setHasil({ ok: false, pesan: "Jaringan bermasalah. Coba lagi." });
    } finally {
      setKirim(false);
    }
  }

  if (hasil?.ok) {
    return (
      <div className="rounded-[var(--radius-card)] border border-brand/50 bg-brand/10 p-6">
        <h2 className="text-lg font-semibold text-brand-900">Lamaran terkirim</h2>
        <p className="mt-2 text-sm text-muted">
          Nomor lamaran Anda <strong className="text-brand-900">{hasil.kode}</strong>. Kirimkan CV
          ke <a className="text-brand-800 underline" href="mailto:bidadaribinjai@gmail.com">bidadaribinjai@gmail.com</a>{" "}
          dengan subjek <code className="rounded bg-white px-1.5 py-0.5 text-xs">{hasil.kode}</code>.
        </p>
        <button
          type="button"
          onClick={() => setHasil(null)}
          className="mt-4 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Kirim lamaran lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-brand-900">Kirim lamaran</h2>
      <p className="mt-1 text-sm text-muted">
        Isi data singkat di bawah. Setelah itu kirim CV ke email kami dengan subjek nomor lamaran.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nama" className={label}>Nama lengkap *</label>
          <input id="nama" name="nama" required minLength={3} maxLength={150} className={input} />
        </div>
        <div>
          <label htmlFor="telepon" className={label}>Telepon / WhatsApp *</label>
          <input id="telepon" name="telepon" required inputMode="tel" className={input} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" className={input} />
        </div>
        <div>
          <label htmlFor="posisi" className={label}>Posisi yang dilamar *</label>
          <input
            id="posisi"
            name="posisi"
            required
            list="daftar-posisi"
            className={input}
            placeholder={posisiList.length ? "Pilih atau tulis posisi" : "Tulis posisi"}
          />
          <datalist id="daftar-posisi">
            {posisiList.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pesan" className={label}>Ringkasan pengalaman</label>
          <textarea id="pesan" name="pesan" rows={4} maxLength={1500} className={input} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="situs">Situs</label>
          <input id="situs" name="situs" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {hasil && !hasil.ok && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {hasil.pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={kirim}
        className="mt-5 rounded-lg bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {kirim ? "Mengirim…" : "Kirim lamaran"}
      </button>
    </form>
  );
}
