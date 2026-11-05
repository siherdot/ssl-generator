import { Pool, types } from "pg";

/**
 * Koneksi ke PostgreSQL untuk situs RSU Mahkota Bidadari.
 *
 * Dulu MariaDB (mysql2). Perbedaan yang dijaga di sini:
 *
 * 1. Placeholder: MySQL `?` -> PostgreSQL `$1, $2, ...`
 * 2. Backtick MySQL dibuang.
 * 3. mysql2 dulu disetel `dateStrings: true`, jadi tanggal keluar sebagai
 *    string. Perilaku itu dipertahankan lewat type parser, karena UI memakai
 *    `value.replace(" ", "T")` dan `tanggalRapi()`.
 * 4. COUNT(*) bertipe bigint di PostgreSQL (dikembalikan sebagai string);
 *    diubah ke number supaya perhitungan di UI tetap benar.
 * 5. Kode lama memanggil `getPool().execute(sql, params)` dan memakai hasilnya
 *    sebagai `[rows, fields]`. Bentuk itu dipertahankan oleh adapter di bawah,
 *    jadi pemanggil tidak perlu diubah satu per satu.
 */

// bigint (mis. COUNT(*)) -> number
types.setTypeParser(20, (v: string) => Number(v));
// date / timestamp / timestamptz -> string apa adanya (seperti dateStrings)
types.setTypeParser(1082, (v: string) => v);
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);

let pool: Pool | null = null;

/** Pool PostgreSQL asli (untuk skrip/CLI, bukan untuk kode aplikasi). */
export function poolAsli(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? "rsumb",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "rsumb",
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    pool.on("error", (err) => {
      console.error("[db] koneksi PostgreSQL error:", err.message);
    });
  }
  return pool;
}

/**
 * Ubah SQL gaya MySQL ke PostgreSQL: `?` -> `$n`, buang backtick,
 * dan ganti beberapa fungsi yang tidak ada di PostgreSQL.
 */
export function kePostgres(sql: string): string {
  let hasil = sql.replace(/`/g, "");
  hasil = hasil.replace(/\bCURDATE\(\)/gi, "CURRENT_DATE");
  hasil = hasil.replace(/\bIFNULL\(/gi, "COALESCE(");

  let nomor = 0;
  let keluaran = "";
  let i = 0;
  while (i < hasil.length) {
    const ch = hasil[i];
    if (ch === "'") {
      // lewati literal string apa adanya, jangan sentuh `?` di dalamnya
      let j = i + 1;
      while (j < hasil.length) {
        if (hasil[j] === "'" && hasil[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (hasil[j] === "'") break;
        j += 1;
      }
      keluaran += hasil.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === "?") {
      nomor += 1;
      keluaran += `$${nomor}`;
      i += 1;
      continue;
    }
    keluaran += ch;
    i += 1;
  }
  return keluaran;
}

export type Param = string | number | null;

/** Jalankan satu query (SQL gaya MySQL, otomatis dikonversi). */
export async function kueri(sql: string, params: Param[] = []) {
  const teks = kePostgres(sql);
  return params.length === 0
    ? poolAsli().query(teks)
    : poolAsli().query(teks, params as unknown[]);
}

export async function rows<T>(sql: string, params: Param[] = []): Promise<T[]> {
  const hasil = await kueri(sql, params);
  return hasil.rows as T[];
}

export async function one<T>(sql: string, params: Param[] = []): Promise<T | null> {
  const list = await rows<T>(sql, params);
  return list.length > 0 ? list[0] : null;
}

export type HasilGayaMysql = [unknown[], unknown];

export type PoolGayaMysql = {
  execute(sql: string, params?: Param[]): Promise<HasilGayaMysql>;
  query(sql: string, params?: Param[]): Promise<HasilGayaMysql>;
};

const adapter: PoolGayaMysql = {
  async execute(sql, params = []) {
    const hasil = await kueri(sql, params);
    return [hasil.rows, hasil.fields];
  },
  async query(sql, params = []) {
    const hasil = await kueri(sql, params);
    return [hasil.rows, hasil.fields];
  },
};

/** Pengganti `mysql2.Pool` dengan bentuk API yang sama untuk pemanggil lama. */
export function getPool(): PoolGayaMysql {
  return adapter;
}
