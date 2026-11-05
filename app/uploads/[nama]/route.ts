import { readFile } from "node:fs/promises";
import path from "node:path";

const FOLDER = "/app/public/images/arsip";

const TIPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

/**
 * Melayani gambar hasil unggahan dashboard yang tersimpan di folder aset.
 * Hanya menerima nama berkas polos (tanpa garis miring) yang berawalan "up-".
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nama: string }> }
) {
  const { nama } = await params;
  const bersih = decodeURIComponent(nama);

  if (!bersih.startsWith("up-") || bersih.includes("/") || bersih.includes("..")) {
    return new Response("Tidak ditemukan", { status: 404 });
  }

  const ext = path.extname(bersih).toLowerCase();
  const tipe = TIPE[ext];
  if (!tipe) return new Response("Tidak ditemukan", { status: 404 });

  try {
    const isi = await readFile(path.join(FOLDER, bersih));
    return new Response(new Uint8Array(isi), {
      headers: {
        "Content-Type": tipe,
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Tidak ditemukan", { status: 404 });
  }
}
