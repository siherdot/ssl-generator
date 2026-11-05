"use client";

import { useState } from "react";

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

const aspek = [
  { kunci: "r_pendaftaran", judul: "Pendaftaran & administrasi" },
  { kunci: "r_dokter", judul: "Pelayanan dokter" },
  { kunci: "r_perawat", judul: "Pelayanan perawat & petugas" },
  { kunci: "r_fasilitas", judul: "Fasilitas rumah sakit" },
  { kunci: "r_kebersihan", judul: "Kebersihan & kenyamanan" },
] as const;

type Kunci = (typeof aspek)[number]["kunci"];

export default function SurveiForm({ unitList }: { unitList: string[] }) {
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; pesan?: string; nilai?: number } | null>(null);
  const [nilai, setNilai] = useState<Record<Kunci, number>>({
    r_pendaftaran: 0,
    r_dokter: 0,
    r_perawat: 0,
    r_fasilitas: 0,
    r_kebersihan: 0,
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const kosong = aspek.filter((a) => !nilai[a.kunci]);
    if (kosong.length > 0) {
      setHasil({ ok: false, pesan: `Masih ada penilaian yang belum diisi: ${kosong[0].judul}.` });
      return;
    }

    setKirim(true);
    setHasil(null);
    const fd = new FormData(e.currentTarget);
    const body = { ...Object.fromEntries(fd.entries()), ...nilai };

    try {
      const res = await fetch("/api/survei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setHasil(json);
      if (json.ok) {
        (e.target as HTMLFormElement).reset();
        setNilai({
          r_pendaftaran: 0,
          r_dokter: 0,
          r_perawat: 0,
          r_fasilitas: 0,
          r_kebersihan: 0,
        });
      }
    } catch {
      setHasil({ ok: false, pesan: "Jaringan bermasalah. Coba lagi." });
    } finally {
      setKirim(false);
    }
  }

  if (hasil?.ok) {
    return (
      <div className="rounded-[var(--radius-card)] border border-brand/50 bg-brand/10 p-6">
        <h2 className="text-lg font-semibold text-brand-900">Terima kasih!</h2>
        <p className="mt-2 text-sm text-muted">
          Survei Anda sudah kami terima
          {typeof hasil.nilai === "number" && (
            <>
              {" "}
              dengan nilai rata-rata <strong className="text-brand-900">{hasil.nilai}/5</strong>
            </>
          )}
          . Masukan ini kami pakai untuk memperbaiki pelayanan.
        </p>
        <button
          type="button"
          onClick={() => setHasil(null)}
          className="mt-4 rounded-lg border border-brand-800 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-800 hover:text-white"
        >
          Isi survei lagi
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
    >
      <h2 className="text-lg font-semibold text-brand-900">Survei Kepuasan Pasien</h2>
      <p className="mt-1 text-sm text-muted">
        Beri penilaian 1–5 bintang untuk tiap aspek. Cukup 1 menit, tanpa login.
      </p>

      <div className="mt-5 space-y-4">
        {aspek.map((a) => (
          <fieldset key={a.kunci}>
            <legend className="text-sm font-medium text-ink">{a.judul}</legend>
            <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label={a.judul}>
              {[1, 2, 3, 4, 5].map((n) => {
                const aktif = nilai[a.kunci] >= n;
                return (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setNilai((v) => ({ ...v, [a.kunci]: n }))}
                    aria-label={`${n} bintang untuk ${a.judul}`}
                    aria-pressed={nilai[a.kunci] === n}
                    className={`text-2xl leading-none transition ${
                      aktif ? "text-sun" : "text-line hover:text-sun/70"
                    }`}
                  >
                    ★
                  </button>
                );
              })}
              <span className="ml-2 self-center text-xs text-muted">
                {nilai[a.kunci] ? `${nilai[a.kunci]}/5` : "belum dinilai"}
              </span>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unit" className={label}>
            Unit / poliklinik yang dikunjungi <span className="text-red-600">*</span>
          </label>
          <input
            id="unit"
            name="unit"
            list="daftar-unit"
            required
            placeholder="mis. Poliklinik Penyakit Dalam"
            className={input}
          />
          <datalist id="daftar-unit">
            {unitList.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="nama" className={label}>
            Nama (opsional)
          </label>
          <input id="nama" name="nama" placeholder="Boleh dikosongkan" className={input} />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="komentar" className={label}>
          Apa yang sudah baik?
        </label>
        <textarea id="komentar" name="komentar" rows={3} className={input} />
      </div>

      <div className="mt-4">
        <label htmlFor="saran" className={label}>
          Apa yang perlu kami perbaiki?
        </label>
        <textarea id="saran" name="saran" rows={3} className={input} />
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="situs"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {hasil && !hasil.ok && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {hasil.pesan ?? "Gagal mengirim survei."}
        </p>
      )}

      <button
        type="submit"
        disabled={kirim}
        className="mt-5 w-full rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60 sm:w-auto"
      >
        {kirim ? "Mengirim…" : "Kirim survei"}
      </button>

      <p className="mt-3 text-xs text-muted">
        Data hanya dipakai untuk evaluasi mutu pelayanan. Tidak dibagikan ke pihak lain.
      </p>
    </form>
  );
}
