import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/admin/shell";
import { wajibAkses } from "@/lib/admin/auth";
import FormKonten from "@/components/admin/form-konten";
import TombolHapus from "@/components/admin/tombol-hapus";
import { aksiHapusKonten } from "@/app/admin/actions";
import { ambilBaris, daftarBaris, opsiPilihan } from "@/lib/admin/crud";
import { cariResource } from "@/lib/admin/resources";
import { urlGambar } from "@/lib/gambar";
import { tanggalRapi } from "@/lib/data";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ resource: string }>;
type SearchParams = Promise<{ q?: string; halaman?: string; simpan?: string; hapus?: string }>;

export default async function KontenPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await wajibAkses("konten");

  const { resource } = await params;
  const sp = await searchParams;
  const res = cariResource(resource);
  if (!res) notFound();

  const opsi = {
    poli: await opsiPilihan("poli"),
    dokter: await opsiPilihan("dokter"),
  };

  /* ------- konten tunggal (profil RS) langsung tampil sebagai form ------- */
  if (res.tunggal) {
    const baris = await ambilBaris(res, res.tunggal);
    return (
      <Shell>
        <h1 className="text-xl font-bold text-brand-900">{res.label}</h1>
        {res.keterangan && <p className="mt-1 text-sm text-muted">{res.keterangan}</p>}
        {sp.simpan && (
          <p className="mt-3 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">Perubahan tersimpan.</p>
        )}
        <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
          <FormKonten resource={res} nilaiAwal={baris ?? {}} opsi={opsi} />
        </div>
      </Shell>
    );
  }

  /* --------------------------- daftar baris --------------------------- */
  const halaman = Number(sp.halaman ?? 1) || 1;
  const { data, total, perHalaman } = await daftarBaris(res, { q: sp.q, halaman });
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-900">{res.label}</h1>
          <p className="mt-1 text-sm text-muted">{total} data</p>
        </div>
        <Link
          href={`/admin/konten/${res.kunci}/baru`}
          className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Tambah {res.labelSatu}
        </Link>
      </div>

      {sp.simpan && (
        <p className="mt-4 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">Data tersimpan.</p>
      )}
      {sp.hapus && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Data dihapus.</p>
      )}

      <form className="mt-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder={`Cari ${res.label.toLowerCase()}…`}
          className="w-full max-w-xs rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-700"
        />
        <button type="submit" className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
          Cari
        </button>
        {sp.q && (
          <Link href={`/admin/konten/${res.kunci}`} className="rounded-lg border border-line px-4 py-2 text-sm text-muted">
            Reset
          </Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-mist text-left text-[11px] uppercase tracking-wide text-muted">
            <tr>
              {res.kolomDaftar.map((k) => (
                <th key={k.nama} className="px-4 py-3">{k.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={res.kolomDaftar.length + 1} className="px-4 py-8 text-center text-muted">
                  Belum ada data.
                </td>
              </tr>
            )}
            {data.map((baris) => {
              const id = String(baris[res.pk] ?? "");
              return (
                <tr key={id} className="border-t border-line">
                  {res.kolomDaftar.map((k) => {
                    const nilai = baris[k.nama];
                    const teks = nilai === null || nilai === undefined ? "" : String(nilai);
                    return (
                      <td key={k.nama} className="px-4 py-3 align-middle">
                        {k.tipe === "gambar" ? (
                          teks ? (
                            <Image
                              src={urlGambar(teks)}
                              alt=""
                              width={44}
                              height={44}
                              unoptimized
                              className="h-11 w-11 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )
                        ) : k.tipe === "tanggal" ? (
                          tanggalRapi(teks) ?? "—"
                        ) : k.tipe === "aktif" ? (
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              teks === "1" ? "bg-brand/20 text-brand-900" : "bg-mist text-muted"
                            }`}
                          >
                            {teks === "1" ? "ya" : "tidak"}
                          </span>
                        ) : (
                          <span className="line-clamp-2 max-w-[420px]">{teks}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/konten/${res.kunci}/${encodeURIComponent(id)}`}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-mist"
                      >
                        Edit
                      </Link>
                      <form action={aksiHapusKonten}>
                        <input type="hidden" name="__resource" value={res.kunci} />
                        <input type="hidden" name="__id" value={id} />
                        <TombolHapus />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalHalaman > 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/konten/${res.kunci}?${new URLSearchParams({
                ...(sp.q ? { q: sp.q } : {}),
                halaman: String(n),
              })}`}
              className={`rounded-lg px-3 py-1.5 ${
                n === halaman ? "bg-brand-700 font-semibold text-white" : "border border-line text-muted hover:bg-mist"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
