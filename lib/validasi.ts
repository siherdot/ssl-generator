import { z } from "zod";

/* ------------------------------------------------------------------
   Potongan skema yang dipakai beberapa endpoint.
   Catatan penting: `.optional().or(z.literal(""))` TIDAK menerima key yang
   tidak dikirim sama sekali (yang terjadi saat form tanpa field opsional),
   sedangkan `.optional().default("")` menerima. Karena itu dipakai bentuk kedua.
   ------------------------------------------------------------------ */

/** Email opsional: kosong atau format email valid. */
export const emailOpsional = z
  .string()
  .trim()
  .max(120, "Email terlalu panjang")
  .optional()
  .default("")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Email tidak valid",
  });

/** Telepon opsional: kosong atau 8–25 karakter angka/tanda. */
export const teleponOpsional = z
  .string()
  .trim()
  .max(25)
  .optional()
  .default("")
  .refine((v) => v === "" || /^[0-9+\-()\s]{8,25}$/.test(v), {
    message: "Nomor telepon tidak valid",
  });

/** Telepon wajib. */
export const teleponWajib = z
  .string()
  .trim()
  .regex(/^[0-9+\-()\s]{8,25}$/, "Nomor telepon tidak valid");

/** Kolom jebakan bot: harus kosong. */
export const honeypot = z.string().max(0).optional().default("");

/** Tanggal YYYY-MM-DD, opsional (kosong diperbolehkan). */
export const tanggalOpsional = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Tanggal tidak valid",
  });

/** Validasi data pendaftaran online. */
export const pendaftaranSchema = z.object({
  nama_pasien: z
    .string()
    .trim()
    .min(3, "Nama pasien minimal 3 karakter")
    .max(150, "Nama pasien terlalu panjang"),
  telepon: teleponWajib,
  tanggal_lahir: tanggalOpsional,
  id_poli: z.string().trim().min(1, "Pilih poliklinik"),
  id_dokter: z.string().trim().optional().default(""),
  tanggal_kunjungan: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kunjungan tidak valid"),
  penjamin: z.string().trim().min(1, "Pilih penjamin"),
  no_penjamin: z.string().trim().max(60).optional().default(""),
  keluhan: z.string().trim().max(1000).optional().default(""),
});

export type PendaftaranInput = z.infer<typeof pendaftaranSchema>;
