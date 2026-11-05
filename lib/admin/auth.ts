import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getPool, one } from "@/lib/db";

const COOKIE = "rsub_admin";
const UMUR_DETIK = 60 * 60 * 8; // 8 jam

export type Admin = {
  id: number;
  username: string;
  nama: string;
  role: string;
  aktif: number;
};

function rahasia(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET belum diisi (minimal 32 karakter). Isi di next/.env lalu restart container."
    );
  }
  return s;
}

function tandaTangan(data: string): string {
  return createHmac("sha256", rahasia()).update(data).digest("base64url");
}

function buatToken(payload: { id: number; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${tandaTangan(data)}`;
}

function bacaToken(token: string | undefined): { id: number; exp: number } | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const harap = tandaTangan(data);
  const a = Buffer.from(sig);
  const b = Buffer.from(harap);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const isi = JSON.parse(Buffer.from(data, "base64url").toString()) as { id: number; exp: number };
    if (!isi?.id || !isi?.exp || isi.exp < Date.now()) return null;
    return isi;
  } catch {
    return null;
  }
}

export async function masuk(username: string, password: string): Promise<string | null> {
  const user = await one<Admin & { password_hash: string }>(
    "SELECT id, username, nama, role, aktif, password_hash FROM admin_user WHERE username = ? LIMIT 1",
    [username.trim().toLowerCase()]
  );

  if (!user || user.aktif !== 1) return "Username atau password salah.";
  const cocok = await bcrypt.compare(password, user.password_hash);
  if (!cocok) return "Username atau password salah.";

  const jar = await cookies();
  jar.set(COOKIE, buatToken({ id: user.id, exp: Date.now() + UMUR_DETIK * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: UMUR_DETIK,
  });

  await getPool().execute("UPDATE admin_user SET terakhir_login = NOW() WHERE id = ?", [user.id]);
  return null;
}

export async function keluar() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function adminSekarang(): Promise<Admin | null> {
  const jar = await cookies();
  const isi = bacaToken(jar.get(COOKIE)?.value);
  if (!isi) return null;

  const user = await one<Admin>(
    "SELECT id, username, nama, role, aktif FROM admin_user WHERE id = ? LIMIT 1",
    [isi.id]
  );
  if (!user || user.aktif !== 1) return null;
  return user;
}

export async function wajibLogin(): Promise<Admin> {
  const user = await adminSekarang();
  if (!user) redirect("/admin/login");
  return user;
}

export async function adaAdmin(): Promise<boolean> {
  const r = await one<{ n: number }>("SELECT COUNT(*) AS n FROM admin_user");
  return Number(r?.n ?? 0) > 0;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function gantiPassword(id: number, passwordBaru: string) {
  await getPool().execute("UPDATE admin_user SET password_hash = ? WHERE id = ?", [
    await hashPassword(passwordBaru),
    id,
  ]);
}

export async function buatAdmin(username: string, nama: string, password: string) {
  await getPool().execute(
    "INSERT INTO admin_user (username, nama, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [username.trim().toLowerCase(), nama.trim(), await hashPassword(password)]
  );
}

/* ------------------------------------------------------------------
   Hak akses per area
   ------------------------------------------------------------------ */

import type { Area } from "./akses";
import { boleh } from "./akses";

export async function wajibAkses(area: Area): Promise<Admin> {
  const user = await wajibLogin();
  if (!boleh(user.role, area)) {
    redirect(`/admin?tolak=${area}`);
  }
  return user;
}

/** Hanya boleh untuk peran admin. */
export async function wajibAdmin(): Promise<Admin> {
  return wajibAkses("pengguna");
}
