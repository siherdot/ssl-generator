import { waktuDb } from "@/lib/data";

/** Format tanggal-waktu untuk tampilan dashboard (WIB). */
export function tanggalWaktu(nilai: string | null | undefined): string {
  if (!nilai) return "—";
  const d = waktuDb(nilai);
  if (!d) return String(nilai);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

/** Format tanggal saja. */
export function tanggalSaja(nilai: string | null | undefined): string {
  if (!nilai) return "—";
  if (String(nilai).startsWith("0000-00-00")) return "—";
  const d = waktuDb(String(nilai));
  if (!d) return String(nilai);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}
