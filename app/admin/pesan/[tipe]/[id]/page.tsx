import Link from "next/link";

/**
 * Halaman detail pesan/lamaran belum dibuat pada versi aplikasi ini.
 * Berkas aslinya kosong sehingga build Next.js gagal; halaman ini
 * menggantikannya agar build tetap jalan dan tautan tidak 404.
 */
export default async function DetailPesan({
  params,
}: {
  params: Promise<{ tipe: string; id: string }>;
}) {
  const { tipe, id } = await params;
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold text-ink">Halaman detail belum tersedia</h1>
      <p className="mt-2 text-sm text-muted">
        Detail <strong>{tipe}</strong> dengan id{" "}
        <code className="rounded bg-line/40 px-1">{id}</code> belum dibuat pada versi
        aplikasi yang sedang dijalankan.
      </p>
      <Link
        href={`/admin/pesan/${tipe}`}
        className="mt-4 inline-block rounded-lg border border-line px-4 py-2 text-sm text-muted"
      >
        Kembali ke daftar
      </Link>
    </div>
  );
}
