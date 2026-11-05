import Link from "next/link";

/**
 * Form "ubah konten" belum dibuat pada versi aplikasi ini.
 * Berkas aslinya kosong sehingga build Next.js gagal; halaman ini
 * menggantikannya agar build tetap jalan dan tautan tidak 404.
 */
export default async function UbahKonten({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold text-ink">Form ubah belum tersedia</h1>
      <p className="mt-2 text-sm text-muted">
        Halaman untuk mengubah <strong>{resource}</strong> dengan id{" "}
        <code className="rounded bg-line/40 px-1">{id}</code> belum dibuat pada versi
        aplikasi yang sedang dijalankan.
      </p>
      <Link
        href={`/admin/konten/${resource}`}
        className="mt-4 inline-block rounded-lg border border-line px-4 py-2 text-sm text-muted"
      >
        Kembali ke daftar
      </Link>
    </div>
  );
}
