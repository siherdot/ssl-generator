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

