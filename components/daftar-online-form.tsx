"use client";

import { useMemo, useState } from "react";

type Poli = { id_poli: string; nama_poli: string };
type DokterRingkas = { id_dokter: string; nama_dokter: string; id_poli: string };
type Penjamin = { id: number; nama: string; kategori: string };

type Props = {
  poliList: Poli[];
  dokterList: DokterRingkas[];
  penjaminList: Penjamin[];
  dokterAwal?: string;
};

const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const input =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function DaftarOnlineForm({ poliList, dokterList, penjaminList, dokterAwal }: Props) {
  const [poli, setPoli] = useState("");
  const [dokter, setDokter] = useState(dokterAwal ?? "");
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; kode?: string; pesan?: string; notif?: boolean } | null>(null);

  const dokterTersedia = useMemo(
    () => (poli ? dokterList.filter((d) => d.id_poli === poli) : dokterList),
    [poli, dokterList]
  );

  const hariIni = new Date();
  const besok = new Date(hariIni.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKirim(true);
    setHasil(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      nama_pasien: String(fd.get("nama_pasien") ?? ""),
      telepon: String(fd.get("telepon") ?? ""),
      tanggal_lahir: String(fd.get("tanggal_lahir") ?? ""),
      id_poli: String(fd.get("id_poli") ?? ""),
      id_dokter: String(fd.get("id_dokter") ?? ""),
      tanggal_kunjungan: String(fd.get("tanggal_kunjungan") ?? ""),
      penjamin: String(fd.get("penjamin") ?? ""),
      no_penjamin: String(fd.get("no_penjamin") ?? ""),
      keluhan: String(fd.get("keluhan") ?? ""),
    };

    try {
      const res = await fetch("/api/pendaftaran", {
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
        <h2 className="text-lg font-semibold text-brand-900">Pendaftaran diterima</h2>
        <p className="mt-2 text-sm text-muted">
          Tunjukkan kode ini di loket pendaftaran. Datang 15 menit sebelum jadwal.
        </p>
        <p className="mt-4 rounded-lg bg-white px-4 py-3 text-center text-2xl font-bold tracking-wider text-brand-900 ring-1 ring-line">
          {hasil.kode}
        </p>
        <button
          type="button"
          onClick={() => setHasil(null)}
          className="mt-5 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Daftarkan pasien lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] lg:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nama_pasien" className={label}>Nama pasien *</label>
          <input id="nama_pasien" name="nama_pasien" required minLength={3} maxLength={150} className={input} placeholder="Sesuai KTP / kartu berobat" />
        </div>
        <div>
          <label htmlFor="telepon" className={label}>Nomor telepon / WhatsApp *</label>
          <input id="telepon" name="telepon" required inputMode="tel" className={input} placeholder="0812xxxxxxx" />
        </div>
        <div>
          <label htmlFor="tanggal_lahir" className={label}>Tanggal lahir</label>
          <input id="tanggal_lahir" name="tanggal_lahir" type="date" max={hariIni.toISOString().slice(0, 10)} className={input} />
        </div>
        <div>
          <label htmlFor="tanggal_kunjungan" className={label}>Tanggal kunjungan *</label>
          <input id="tanggal_kunjungan" name="tanggal_kunjungan" type="date" required min={besok} className={input} />
        </div>
        <div>
          <label htmlFor="id_poli" className={label}>Poliklinik *</label>
          <select
            id="id_poli"
            name="id_poli"
            required
            className={input}
            value={poli}
            onChange={(e) => {
              setPoli(e.target.value);
              setDokter("");
            }}
          >
            <option value="">Pilih poliklinik</option>
            {poliList.map((p) => (
              <option key={p.id_poli} value={p.id_poli}>{p.nama_poli}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="id_dokter" className={label}>Dokter (opsional)</label>
          <select id="id_dokter" name="id_dokter" className={input} value={dokter} onChange={(e) => setDokter(e.target.value)}>
            <option value="">Belum tentukan dokter</option>
            {dokterTersedia.map((d) => (
              <option key={d.id_dokter} value={d.id_dokter}>{d.nama_dokter}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="penjamin" className={label}>Penjamin *</label>
          <select id="penjamin" name="penjamin" required className={input} defaultValue="Umum / pribadi">
            <option value="Umum / pribadi">Umum / pribadi</option>
            {penjaminList.map((p) => (
              <option key={p.id} value={p.nama}>{p.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="no_penjamin" className={label}>Nomor kartu penjamin</label>
          <input id="no_penjamin" name="no_penjamin" maxLength={60} className={input} placeholder="Kosongkan bila umum" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="keluhan" className={label}>Keluhan singkat</label>
          <textarea id="keluhan" name="keluhan" rows={3} maxLength={1000} className={input} placeholder="Contoh: kontrol pasca operasi, nyeri dada sejak 2 hari" />
        </div>
      </div>

      {hasil && !hasil.ok && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {hasil.pesan}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={kirim}
          className="rounded-lg bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {kirim ? "Mengirim…" : "Kirim pendaftaran"}
        </button>
        <p className="text-xs text-muted">
          Data hanya dipakai untuk keperluan pendaftaran di RSU Mahkota Bidadari.
        </p>
      </div>
    </form>
  );
}
