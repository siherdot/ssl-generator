import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Shell from "@/components/admin/shell";
import FormKonten from "@/components/admin/form-konten";
import { wajibAkses } from "@/lib/admin/auth";
import { opsiPilihan } from "@/lib/admin/crud";
import { cariResource } from "@/lib/admin/resources";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ resource: string }>;

export default async function TambahKonten({ params }: { params: Params }) {
  await wajibAkses("konten");

  const { resource } = await params;
  const res = cariResource(resource);
  if (!res) notFound();

  // Konten tunggal (profil RS) tidak punya "tambah"; formnya ada di halaman daftar.
  if (res.tunggal) redirect(`/admin/konten/${res.kunci}`);

  const opsi = {
    poli: await opsiPilihan("poli"),
    dokter: await opsiPilihan("dokter"),
  };

  return (
    <Shell>
      <Link href={`/admin/konten/${res.kunci}`} className="text-sm text-muted hover:text-brand-800">
        ← {res.label}
      </Link>
      <h1 className="mt-2 text-xl font-bold text-brand-900">{res.labelSatu} baru</h1>
      {res.keterangan && <p className="mt-1 text-sm text-muted">{res.keterangan}</p>}

      <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
        <FormKonten resource={res} nilaiAwal={{}} opsi={opsi} />
      </div>
    </Shell>
  );
}
