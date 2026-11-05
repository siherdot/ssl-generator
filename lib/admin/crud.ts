import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPool, one, rows, type Param } from "@/lib/db";
import type { Resource } from "./resources";

const FOLDER_GAMBAR = "/app/public/images/arsip";

export type Baris = Record<string, string | number | null>;

/** Ambil daftar baris untuk halaman daftar. */
export async function daftarBaris(
  res: Resource,
  opts: { q?: string; halaman?: number; perHalaman?: number } = {}
) {
  const perHalaman = opts.perHalaman ?? 25;
  const halaman = Math.max(1, opts.halaman ?? 1);
  const offset = (halaman - 1) * perHalaman;

  const where: string[] = [];
  const params: Param[] = [];
  if (opts.q && res.cari.length > 0) {
    where.push("(" + res.cari.map((k) => `\`${k}\` LIKE ?`).join(" OR ") + ")");
    for (const _ of res.cari) params.push(`%${opts.q}%`);
  }

  const klausa = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const kolom = ["*", res.pk].filter((v, i, a) => a.indexOf(v) === i).join(", ");

  const data = await rows<Baris>(
    `SELECT ${kolom} FROM \`${res.tabel}\` ${klausa} ORDER BY ${res.urut} LIMIT ? OFFSET ?`,
    [...params, perHalaman, offset]
  );

  const total = await one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM \`${res.tabel}\` ${klausa}`,
    params
  );

  return { data, total: Number(total?.n ?? 0), halaman, perHalaman };
}

export async function ambilBaris(res: Resource, id: string | number): Promise<Baris | null> {
  const kunci = res.tunggal ?? String(id);
  return one<Baris>(`SELECT * FROM \`${res.tabel}\` WHERE \`${res.pk}\` = ? LIMIT 1`, [kunci]);
}

/** Id otomatis untuk tabel lama: NEWS-24, DR35, P17, facility-19 … */
export async function idBerikutnya(res: Resource): Promise<string> {
  if (!res.idOtomatis) return "";
  const { prefix, panjang = 2 } = res.idOtomatis;

  const hasil = await rows<{ id: string }>(
    `SELECT \`${res.pk}\` AS id FROM \`${res.tabel}\` WHERE \`${res.pk}\` LIKE ?`,
    [`${prefix}%`]
  );

  let maks = 0;
  for (const h of hasil) {
    const angka = Number(String(h.id).slice(prefix.length).replace(/[^0-9]/g, ""));
    if (Number.isFinite(angka) && angka > maks) maks = angka;
  }
  const berikut = String(maks + 1).padStart(panjang, "0");
  return `${prefix}${berikut}`;
}

function bersihkanNilai(nilai: FormDataEntryValue | null | undefined, tipe: string): Param {
  const s = typeof nilai === "string" ? nilai.trim() : "";

  if (tipe === "checkbox") return s === "on" || s === "1" ? 1 : 0;
  if (tipe === "number") {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  if (tipe === "date") return s === "" ? null : s;
  if (tipe === "time") return s === "" ? null : s;
  return s;
}

/** Simpan (insert atau update). Mengembalikan id baris. */
export async function simpanBaris(res: Resource, fd: FormData): Promise<string> {
  const nilai: Record<string, Param> = {};

  for (const f of res.fields) {
    nilai[f.nama] = bersihkanNilai(fd.get(f.nama), f.tipe);
  }

  // baris tunggal (profil RS) → selalu UPDATE
  if (res.tunggal) {
    const kolom = Object.keys(nilai);
    await getPool().execute(
      `UPDATE \`${res.tabel}\` SET ${kolom.map((k) => `\`${k}\` = ?`).join(", ")} WHERE \`${res.pk}\` = ?`,
      [...kolom.map((k) => nilai[k]), res.tunggal]
    );
    return res.tunggal;
  }

  const idBaru = String(fd.get("__id") ?? "").trim();

  if (idBaru !== "") {
    const kolom = Object.keys(nilai);
    await getPool().execute(
      `UPDATE \`${res.tabel}\` SET ${kolom.map((k) => `\`${k}\` = ?`).join(", ")} WHERE \`${res.pk}\` = ?`,
      [...kolom.map((k) => nilai[k]), idBaru]
    );
    return idBaru;
  }

  const id = res.idOtomatis ? await idBerikutnya(res) : "";
  const kolom = [...(id ? [res.pk] : []), ...Object.keys(nilai)];
  const isi = [...(id ? [id] : []), ...Object.keys(nilai).map((k) => nilai[k])];

  // PostgreSQL tidak punya LAST_INSERT_ID(); INSERT ... RETURNING mengembalikan id langsung.
  const hasil = await rows<{ id: string | number }>(
    `INSERT INTO \`${res.tabel}\` (${kolom.map((k) => `\`${k}\``).join(", ")}) VALUES (${kolom
      .map(() => "?")
      .join(", ")}) RETURNING \`${res.pk}\` AS id`,
    isi
  );
  return String(hasil[0]?.id ?? "");
}

export async function hapusBaris(res: Resource, id: string | number) {
  await getPool().execute(`DELETE FROM \`${res.tabel}\` WHERE \`${res.pk}\` = ?`, [String(id)]);
}

/** Pilihan untuk field select yang mengambil data dari tabel lain. */
export async function opsiPilihan(jenis: "poli" | "dokter") {
  if (jenis === "poli") {
    return rows<{ nilai: string; label: string }>(
      "SELECT id_poli AS nilai, nama_poli AS label FROM poli ORDER BY nama_poli"
    );
  }
  return rows<{ nilai: string; label: string }>(
    "SELECT id_dokter AS nilai, CONCAT(nama_dokter, ' — ', COALESCE((SELECT nama_poli FROM poli p WHERE p.id_poli = d.id_poli), '')) AS label FROM dokter d ORDER BY nama_dokter"
  );
}

const EKSTENSI_BOLEH = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Simpan gambar unggahan ke folder aset (dipakai situs lama juga). */
export async function simpanGambar(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 8 MB.");

  const ext = path.extname(file.name).toLowerCase();
  if (!EKSTENSI_BOLEH.has(ext)) {
    throw new Error("Format gambar harus JPG, PNG, WEBP, atau GIF.");
  }

  await mkdir(FOLDER_GAMBAR, { recursive: true });
  const nama = `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
  const isi = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(FOLDER_GAMBAR, nama), isi);
  return nama;
}
