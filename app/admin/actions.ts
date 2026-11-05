"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
import {
  adaAdmin,
  adminSekarang,
  buatAdmin,
  gantiPassword,
  keluar,
  masuk,
  wajibAdmin,
  wajibAkses,
  wajibLogin,
} from "@/lib/admin/auth";
import { cariResource, cariInbox } from "@/lib/admin/resources";
import { hapusBaris, simpanBaris, simpanGambar } from "@/lib/admin/crud";

export type HasilAksi = { error?: string; sukses?: string } | null;

/* ----------------------------- autentikasi ----------------------------- */

const percobaan = new Map<string, { n: number; sampai: number }>();

function bolehCobaLagi(kunci: string): boolean {
  const data = percobaan.get(kunci);
  if (!data) return true;
  if (Date.now() > data.sampai) {
    percobaan.delete(kunci);
    return true;
  }
  return data.n < 5;
}

function catatGagal(kunci: string) {
  const data = percobaan.get(kunci) ?? { n: 0, sampai: 0 };
  data.n += 1;
  data.sampai = Date.now() + 10 * 60 * 1000; // blokir 10 menit
  percobaan.set(kunci, data);
}

export async function aksiMasuk(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  const username = String(fd.get("username") ?? "").trim();
  const password = String(fd.get("password") ?? "");

  if (!username || !password) return { error: "Username dan password wajib diisi." };
  if (!bolehCobaLagi(username)) {
    return { error: "Terlalu banyak percobaan gagal. Coba lagi 10 menit kemudian." };
  }

  const salah = await masuk(username, password);
  if (salah) {
    catatGagal(username);
    return { error: salah };
  }

  percobaan.delete(username);
  redirect("/admin");
}

export async function aksiKeluar() {
  await keluar();
  redirect("/admin/login");
}

export async function aksiSetupAdmin(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  if (await adaAdmin()) return { error: "Akun admin sudah ada. Silakan login." };

  const username = String(fd.get("username") ?? "").trim().toLowerCase();
  const nama = String(fd.get("nama") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const ulangi = String(fd.get("ulangi") ?? "");

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return { error: "Username 3–30 karakter, hanya huruf kecil, angka, titik, garis bawah, atau strip." };
  }
  if (password.length < 10) return { error: "Password minimal 10 karakter." };
  if (password !== ulangi) return { error: "Ulangi password tidak sama." };

  await buatAdmin(username, nama || username, password);
  const salah = await masuk(username, password);
  if (salah) return { error: salah };
  redirect("/admin");
}

export async function aksiGantiPassword(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  const admin = await wajibLogin();
  const lama = String(fd.get("lama") ?? "");
  const baru = String(fd.get("baru") ?? "");
  const ulangi = String(fd.get("ulangi") ?? "");

  if (baru.length < 10) return { error: "Password baru minimal 10 karakter." };
  if (baru !== ulangi) return { error: "Ulangi password tidak sama." };

  const cek = await masuk(admin.username, lama);
  if (cek) return { error: "Password lama salah." };

  await gantiPassword(admin.id, baru);
  return { sukses: "Password berhasil diganti." };
}

/* ------------------------------- konten -------------------------------- */

export async function aksiSimpanKonten(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  await wajibAkses("konten");
  const kunci = String(fd.get("__resource") ?? "");
  const res = cariResource(kunci);
  if (!res) return { error: "Jenis konten tidak dikenal." };

  // berkas gambar diunggah lebih dulu, nama file dimasukkan ke field terkait
  for (const f of res.fields) {
    if (f.tipe !== "image") continue;
    const file = fd.get(`__file_${f.nama}`);
    if (file instanceof File && file.size > 0) {
      try {
        const nama = await simpanGambar(file);
        if (nama) fd.set(f.nama, nama);
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Gagal mengunggah gambar." };
      }
    }
  }

  try {
    await simpanBaris(res, fd);
  } catch (err) {
    console.error("Gagal simpan konten:", err);
    return { error: "Gagal menyimpan. Periksa kembali isian, lalu coba lagi." };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/konten/${res.kunci}?simpan=1`);
}

export async function aksiHapusKonten(fd: FormData) {
  await wajibAkses("konten");
  const kunci = String(fd.get("__resource") ?? "");
  const id = String(fd.get("__id") ?? "");
  const res = cariResource(kunci);
  if (!res || !id) return;

  await hapusBaris(res, id);
  revalidatePath("/", "layout");
  redirect(`/admin/konten/${res.kunci}?hapus=1`);
}

/* -------------------------------- inbox -------------------------------- */

export async function aksiUbahStatus(fd: FormData) {
  await wajibAkses("pesan");
  const kunci = String(fd.get("__inbox") ?? "");
  const id = String(fd.get("__id") ?? "");
  const status = String(fd.get("status") ?? "baru");
  const box = cariInbox(kunci);
  if (!box || !id) return;

  await getPool().execute(
    `UPDATE \`${box.tabel}\` SET status = ? WHERE \`${box.pk}\` = ?`,
    [status, id]
  );
  redirect(`/admin/pesan/${box.kunci}/${id}?status=1`);
}

export async function aksiHapusInbox(fd: FormData) {
  await wajibAkses("pesan");
  const kunci = String(fd.get("__inbox") ?? "");
  const id = String(fd.get("__id") ?? "");
  const box = cariInbox(kunci);
  if (!box || !id) return;

  await getPool().execute(`DELETE FROM \`${box.tabel}\` WHERE \`${box.pk}\` = ?`, [id]);
  redirect(`/admin/pesan/${box.kunci}?hapus=1`);
}

/** dipakai halaman akun untuk menampilkan username saat ini */
export async function ambilAdmin() {
  const admin = await adminSekarang();
  return admin;
}

/* --------------------------- pengguna admin --------------------------- */

import { hashPassword } from "@/lib/admin/auth";
import { one } from "@/lib/db";
import type { Peran } from "@/lib/admin/akses";

async function hitungAdminAktif(): Promise<number> {
  const r = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM admin_user WHERE aktif = 1 AND role = 'admin'"
  );
  return Number(r?.n ?? 0);
}

export async function aksiTambahPengguna(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  await wajibAdmin();

  const username = String(fd.get("username") ?? "").trim().toLowerCase();
  const nama = String(fd.get("nama") ?? "").trim();
  const peran = String(fd.get("peran") ?? "editor") as Peran;
  const password = String(fd.get("password") ?? "");
  const ulangi = String(fd.get("ulangi") ?? "");

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return { error: "Username 3–30 karakter: huruf kecil, angka, titik, garis bawah, atau strip." };
  }
  if (password.length < 10) return { error: "Password minimal 10 karakter." };
  if (password !== ulangi) return { error: "Ulangi password tidak sama." };
  if (!["admin", "editor", "operator"].includes(peran)) return { error: "Peran tidak dikenal." };

  const ada = await one<{ id: number }>("SELECT id FROM admin_user WHERE username = ? LIMIT 1", [username]);
  if (ada) return { error: "Username sudah dipakai." };

  await getPool().execute(
    "INSERT INTO admin_user (username, nama, password_hash, role, aktif) VALUES (?, ?, ?, ?, 1)",
    [username, nama || username, await hashPassword(password), peran]
  );

  return { sukses: `Pengguna "${username}" dibuat dengan peran ${peran}.` };
}

export async function aksiUbahPeran(fd: FormData) {
  const saya = await wajibAdmin();
  const id = Number(fd.get("id") ?? 0);
  const peran = String(fd.get("peran") ?? "") as Peran;
  if (!id || !["admin", "editor", "operator"].includes(peran)) return;

  // jangan sampai admin terakhir diturunkan jadi non-admin
  if (id === saya.id && peran !== "admin" && (await hitungAdminAktif()) <= 1) return;

  await getPool().execute("UPDATE admin_user SET role = ? WHERE id = ?", [peran, id]);
  redirect("/admin/pengguna?ubah=1");
}

export async function aksiResetPasswordPengguna(_sebelum: HasilAksi, fd: FormData): Promise<HasilAksi> {
  await wajibAdmin();
  const id = Number(fd.get("id") ?? 0);
  const password = String(fd.get("password") ?? "");
  const ulangi = String(fd.get("ulangi") ?? "");

  if (!id) return { error: "Pengguna tidak dikenal." };
  if (password.length < 10) return { error: "Password minimal 10 karakter." };
  if (password !== ulangi) return { error: "Ulangi password tidak sama." };

  await gantiPassword(id, password);
  return { sukses: "Password pengguna sudah diganti." };
}

export async function aksiToggleAktif(fd: FormData) {
  const saya = await wajibAdmin();
  const id = Number(fd.get("id") ?? 0);
  if (!id) return;
  if (id === saya.id) redirect("/admin/pengguna?tolak=diri-sendiri");

  const target = await one<{ aktif: number; role: string }>(
    "SELECT aktif, role FROM admin_user WHERE id = ? LIMIT 1",
    [id]
  );
  if (!target) return;

  // jangan nonaktifkan admin aktif terakhir
  if (target.aktif === 1 && target.role === "admin" && (await hitungAdminAktif()) <= 1) {
    redirect("/admin/pengguna?tolak=admin-terakhir");
  }

  await getPool().execute("UPDATE admin_user SET aktif = ? WHERE id = ?", [
    target.aktif === 1 ? 0 : 1,
    id,
  ]);
  redirect("/admin/pengguna?ubah=1");
}

export async function aksiHapusPengguna(fd: FormData) {
  const saya = await wajibAdmin();
  const id = Number(fd.get("id") ?? 0);
  if (!id) return;
  if (id === saya.id) redirect("/admin/pengguna?tolak=diri-sendiri");

  const target = await one<{ role: string; aktif: number }>(
    "SELECT role, aktif FROM admin_user WHERE id = ? LIMIT 1",
    [id]
  );
  if (!target) return;
  if (target.role === "admin" && target.aktif === 1 && (await hitungAdminAktif()) <= 1) {
    redirect("/admin/pengguna?tolak=admin-terakhir");
  }

  await getPool().execute("DELETE FROM admin_user WHERE id = ?", [id]);
  redirect("/admin/pengguna?hapus=1");
}
