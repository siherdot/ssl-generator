import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/admin/shell";
import TombolHapus from "@/components/admin/tombol-hapus";
import { aksiHapusInbox, aksiUbahStatus } from "@/app/admin/actions";
import { wajibAkses } from "@/lib/admin/auth";
import { one } from "@/lib/db";
import { cariInbox, statusPilihan } from "@/lib/admin/resources";
import { tanggalWaktu } from "@/lib/admin/format";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ tipe: string; id: string }>;
type SearchParams = Promise<{ status?: string }>;

const warnaStatus: Record<string, string> = {
  baru: "bg-sun/30 text-brand-900",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-brand/20 text-brand-900",
  ditolak: "bg-red-100 text-red-700",
};

export default async function DetailPesan({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await wajibAkses("pesan");

  const { tipe, id } = await params;
  const sp = await searchParams;
  const box = cariInbox(tipe);
  if (!box) notFound();

  const kunci = decodeURIComponent(id);
  const baris = await one<Record<string, string | number | null>>(
    `SELECT * FROM \`${box.tabel}\` WHERE \`${box.pk}\` = ? LIMIT 1`,
    [kunci]
  );
  if (!baris) notFound();

  const statusSekarang = String(baris.status ?? "baru");

  return (
    <Shell>
      <Link href={`/admin/pesan/${box.kunci}`} className="text-sm text-muted hover:text-brand-800">
        ← {box.label}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-brand-900">Detail {box.label.toLowerCase()}</h1>
        <span
          className={`rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            warnaStatus[statusSekarang] ?? "bg-mist text-muted"
          }`}
        >
          {statusSekarang}
        </span>
      </div>

      {sp.status && (
        <p className="mt-3 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">
          Status sudah diperbarui.
        </p>
      )}

      <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
        <dl className="grid gap-4 sm:grid-cols-2">
          {box.detail.map((d) => {
            const nilai = baris[d.nama];
            const teks = nilai === null || nilai === undefined ? "" : String(nilai);
            const penuh = d.nama === "pesan" || d.nama === "keluhan" || d.nama === "saran";
            return (
              <div key={d.nama} className={penuh ? "sm:col-span-2" : ""}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {d.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                  {d.nama === "dibuat" ? tanggalWaktu(teks) : teks || "—"}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <form action={aksiUbahStatus} className="flex items-end gap-2">
          <input type="hidden" name="__inbox" value={box.kunci} />
          <input type="hidden" name="__id" value={kunci} />
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ubah status
            <select
              name="status"
              defaultValue={statusSekarang}
              className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-brand-700"
            >
              {statusPilihan.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Simpan
          </button>
        </form>

        <form action={aksiHapusInbox}>
          <input type="hidden" name="__inbox" value={box.kunci} />
          <input type="hidden" name="__id" value={kunci} />
          <TombolHapus label="Hapus data" />
        </form>
      </div>
    </Shell>
  );
}
