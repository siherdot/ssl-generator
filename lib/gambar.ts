/**
 * Penentu URL gambar. Dipakai situs publik dan dashboard admin.
 *
 * - gambar lama (hasil unggahan panel PHP): /images/arsip/<nama>
 * - gambar baru dari dashboard (prefix "up-"): /uploads/<nama>
 *   Dilayani route handler khusus karena file statis Next hanya mengenali
 *   isi folder public saat build, sehingga unggahan baru akan 404.
 */
export function urlGambar(
  nama: string | null | undefined,
  bawaan = "/images/arsip/logo2.png"
): string {
  const bersih = (nama ?? "").trim();
  if (bersih === "") return bawaan;
  const berkas = encodeURIComponent(bersih);
  return bersih.startsWith("up-") ? `/uploads/${berkas}` : `/images/arsip/${berkas}`;
}
