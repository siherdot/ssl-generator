"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { aksiSimpanKonten, type HasilAksi } from "@/app/admin/actions";
import type { Resource } from "@/lib/admin/resources";
import { urlGambar } from "@/lib/gambar";

type Opsi = { nilai: string; label: string };

const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
const inputCls =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-700";

export default function FormKonten({
  resource,
  nilaiAwal,
  opsi,
}: {
  resource: Resource;
  nilaiAwal: Record<string, string | number | null>;
  opsi: { poli: Opsi[]; dokter: Opsi[] };
}) {
  const [hasil, aksi, sedang] = useActionState<HasilAksi, FormData>(aksiSimpanKonten, null);
  const [pratinjau, setPratinjau] = useState<Record<string, string>>({});

  const idAwal = resource.tunggal ? "" : String(nilaiAwal[resource.pk] ?? "");

  return (
    <form action={aksi} className="space-y-5" encType="multipart/form-data">
      <input type="hidden" name="__resource" value={resource.kunci} />
      {idAwal && <input type="hidden" name="__id" value={idAwal} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {resource.fields.map((f) => {
          const nilai = nilaiAwal[f.nama];
          const teks = nilai === null || nilai === undefined ? "" : String(nilai);
          const penuh = f.lebar === "penuh" || f.tipe === "html" || f.tipe === "textarea";

          return (
            <div key={f.nama} className={penuh ? "sm:col-span-2" : ""}>
              <label htmlFor={f.nama} className={labelCls}>
                {f.label}
                {f.wajib && <span className="text-red-600"> *</span>}
              </label>

              {f.tipe === "textarea" && (
                <textarea
                  id={f.nama}
                  name={f.nama}
                  rows={4}
                  defaultValue={teks}
                  required={f.wajib}
                  className={inputCls}
                />
              )}

              {f.tipe === "html" && (
                <textarea
                  id={f.nama}
                  name={f.nama}
                  rows={8}
                  defaultValue={teks}
                  className={`${inputCls} font-mono text-xs`}
                  placeholder="<p>Isi teks…</p>"
                />
              )}

              {(f.tipe === "text" || f.tipe === "number" || f.tipe === "date" || f.tipe === "time") && (
                <input
                  id={f.nama}
                  name={f.nama}
                  type={f.tipe}
                  defaultValue={teks}
                  required={f.wajib}
                  max={f.maks}
                  step={f.langkah}
                  className={inputCls}
                />
              )}

              {f.tipe === "select" && (
                <select
                  id={f.nama}
                  name={f.nama}
                  defaultValue={teks || String(f.bawaan ?? "")}
                  required={f.wajib}
                  className={inputCls}
                >
                  <option value="">— pilih —</option>
                  {(f.pilihanDari ? opsi[f.pilihanDari] : f.pilihan ?? []).map((o) => (
                    <option key={o.nilai} value={o.nilai}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}

              {f.tipe === "checkbox" && (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    id={f.nama}
                    name={f.nama}
                    type="checkbox"
                    defaultChecked={teks === "1" || (teks === "" && Number(f.bawaan ?? 0) === 1)}
                    className="h-4 w-4 rounded border-line text-brand-700"
                  />
                  Ya
                </label>
              )}

              {f.tipe === "image" && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-line bg-mist">
                    {(pratinjau[f.nama] || teks) && (
                      <Image
                        src={pratinjau[f.nama] || urlGambar(teks)}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      name={`__file_${f.nama}`}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPratinjau((p) => ({ ...p, [f.nama]: URL.createObjectURL(file) }));
                      }}
                      className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                    <input type="hidden" name={f.nama} value={teks} />
                    <p className="mt-1 text-[11px] text-muted">
                      {teks ? `Tersimpan: ${teks}` : "Belum ada gambar."} Maks 8 MB (JPG/PNG/WEBP/GIF).
                    </p>
                  </div>
                </div>
              )}

              {f.bantuan && <p className="mt-1 text-[11px] text-muted">{f.bantuan}</p>}
            </div>
          );
        })}
      </div>

      {hasil?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {hasil.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button
          type="submit"
          disabled={sedang}
          className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {sedang ? "Menyimpan…" : "Simpan"}
        </button>
        <Link
          href={`/admin/konten/${resource.kunci}`}
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-muted hover:bg-mist"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
