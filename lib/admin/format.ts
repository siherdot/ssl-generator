/** Format tanggal-waktu untuk tampilan dashboard. */
export function tanggalWaktu(nilai: string | null | undefined): string {
  if (!nilai) return "—";
  const bersih = nilai.replace(" ", "T");
  const d = new Date(bersih);
  if (Number.isNaN(d.getTime())) return String(nilai);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format tanggal saja. */
export function tanggalSaja(nilai: string | null | undefined): string {
  if (!nilai) return "—";
  if (String(nilai).startsWith("0000-00-00")) return "—";
  const d = new Date(String(nilai).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(nilai);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
