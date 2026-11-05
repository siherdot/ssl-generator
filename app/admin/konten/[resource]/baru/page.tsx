import Link from "next/link";

/**
 * Form "tambah konten" belum dibuat pada versi aplikasi ini.
 * Berkas aslinya kosong sehingga build Next.js gagal; halaman ini
 * menggantikannya agar build tetap jalan dan tautan tidak 404.
 */
export default async function TambahKonten({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold text-ink">Form tambah belum tersedia</h1>
      <p className="mt-2 text-sm text-muted">
        Halaman untuk menambah data <strong>{resource}</strong> belum dibuat pada versi
        aplikasi yang sedang dijalankan. Data lama tetap bisa dilihat dari daftar konten.
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
