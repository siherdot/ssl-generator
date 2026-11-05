import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/admin/shell";
import { wajibAkses } from "@/lib/admin/auth";
import { rows } from "@/lib/db";
import { cariInbox } from "@/lib/admin/resources";
import { tanggalWaktu } from "@/lib/admin/format";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ tipe: string }>;
type SearchParams = Promise<{ status?: string; hapus?: string; halaman?: string }>;

const warnaStatus: Record<string, string> = {
  baru: "bg-sun/30 text-brand-900",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-brand/20 text-brand-900",
  ditolak: "bg-red-100 text-red-700",
};

export default async function InboxPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await wajibAkses("pesan");

  const { tipe } = await params;
  const sp = await searchParams;
  const box = cariInbox(tipe);
  if (!box) notFound();

  const data = await rows<Record<string, string | number | null>>(
    `SELECT * FROM \`${box.tabel}\` ORDER BY ${box.urut} LIMIT 100`
  );

  return (
    <Shell>
      <h1 className="text-xl font-bold text-brand-900">{box.label}</h1>
      <p className="mt-1 text-sm text-muted">{data.length} data terakhir</p>

      {sp.status && (
        <p className="mt-4 rounded-lg bg-brand/10 px-4 py-2 text-sm text-brand-900">Status diperbarui.</p>
      )}
      {sp.hapus && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">Data dihapus.</p>
      )}

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-mist text-left text-[11px] uppercase tracking-wide text-muted">
            <tr>
              {box.kolom.map((k) => (
                <th key={k.nama} className="px-4 py-3">{k.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={box.kolom.length + 1} className="px-4 py-8 text-center text-muted">
                  Belum ada data masuk.
                </td>
              </tr>
            )}
            {data.map((b) => {
              const id = String(b[box.pk] ?? "");
              return (
                <tr key={id} className="border-t border-line">
                  {box.kolom.map((k) => {
                    const nilai = b[k.nama];
                    const teks = nilai === null || nilai === undefined ? "" : String(nilai);
                    return (
                      <td key={k.nama} className="px-4 py-3">
                        {k.nama === "status" ? (
                          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${warnaStatus[teks] ?? "bg-mist text-muted"}`}>
                            {teks || "baru"}
                          </span>
                        ) : k.nama === "dibuat" ? (
                          tanggalWaktu(teks)
                        ) : (
                          <span className="line-clamp-1 max-w-[260px]">{teks}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pesan/${box.kunci}/${encodeURIComponent(id)}`}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-mist"
                    >
                      Buka
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
