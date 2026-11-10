/**
 * Dijalankan sekali saat server Next hidup. Dipakai untuk menyalakan
 * sinkronisasi tempat tidur otomatis dari dalam container (tanpa cron host).
 */
export async function register() {
  // lewati saat `next build` / runtime edge
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { mulaiSinkronTempatTidur } = await import("./lib/simrs/penjadwal");
  mulaiSinkronTempatTidur();
}
