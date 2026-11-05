/**
 * Peran dan hak akses dashboard.
 *
 * admin    : semua — konten, pesan masuk, kelola pengguna
 * editor   : konten + pesan masuk (tidak bisa kelola pengguna)
 * operator : hanya pesan masuk (pendaftaran, lamaran, kontak)
 */

export type Peran = "admin" | "editor" | "operator";
export type Area = "konten" | "pesan" | "pengguna";

export const peranLabel: Record<Peran, string> = {
  admin: "Admin (penuh)",
  editor: "Editor (konten)",
  operator: "Operator (pesan)",
};

export const peranKeterangan: Record<Peran, string> = {
  admin: "Kelola konten, pesan masuk, dan akun pengguna.",
  editor: "Kelola konten situs dan pesan masuk. Tidak bisa mengelola pengguna.",
  operator: "Hanya melihat dan menindaklanjuti pesan masuk.",
};

const hak: Record<Peran, Area[]> = {
  admin: ["konten", "pesan", "pengguna"],
  editor: ["konten", "pesan"],
  operator: ["pesan"],
};

export function boleh(peran: string | null | undefined, area: Area): boolean {
  if (!peran) return false;
  return (hak[peran as Peran] ?? []).includes(area);
}

export function daftarPeran(): { nilai: Peran; label: string }[] {
  return (Object.keys(peranLabel) as Peran[]).map((p) => ({ nilai: p, label: peranLabel[p] }));
}
