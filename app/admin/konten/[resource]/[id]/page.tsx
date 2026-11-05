import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/admin/shell";
import FormKonten from "@/components/admin/form-konten";
import TombolHapus from "@/components/admin/tombol-hapus";
import { aksiHapusKonten } from "@/app/admin/actions";
import { wajibAkses } from "@/lib/admin/auth";
import { ambilBaris, opsiPilihan } from "@/lib/admin/crud";
import { cariResource } from "@/lib/admin/resources";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ resource: string; id: string }>;

export default async function UbahKonten({ params }: { params: Params }) {
  await wajibAkses("konten");

  const { resource, id } = await params;
  const res = cariResource(resource);
  if (!res) notFound();

  const kunci = decodeURIComponent(id);
  const baris = await ambilBaris(res, kunci);
  if (!baris) notFound();

  const opsi = {
    poli: await opsiPilihan("poli"),
    dokter: await opsiPilihan("dokter"),
  };

  return (
    <Shell>
      <Link href={`/admin/konten/${res.kunci}`} className="text-sm text-muted hover:text-brand-800">
        ← {res.label}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-brand-900">
          Ubah {res.labelSatu.toLowerCase()}
          <span className="ml-2 rounded bg-line/40 px-2 py-0.5 align-middle font-mono text-[11px] font-normal text-muted">
            {kunci}
          </span>
        </h1>
        <form action={aksiHapusKonten}>
          <input type="hidden" name="__resource" value={res.kunci} />
          <input type="hidden" name="__id" value={kunci} />
          <TombolHapus label={`Hapus ${res.labelSatu.toLowerCase()}`} />
        </form>
      </div>

      <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
        <FormKonten resource={res} nilaiAwal={baris} opsi={opsi} />
      </div>
    </Shell>
  );
}
