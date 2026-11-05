import { notFound } from "next/navigation";

/**
 * Halaman detail berita belum dibuat pada versi aplikasi ini
 * (berkas aslinya kosong, sehingga build gagal). Sementara ini
 * rutenya mengembalikan 404 yang rapi, bukan halaman kosong.
 */
export default function DetailBerita() {
  notFound();
}
