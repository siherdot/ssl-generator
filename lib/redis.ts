import { createClient } from "redis";

/**
 * Cache Redis untuk situs.
 *
 * Prinsip: Redis bersifat OPSIONAL. Kalau REDIS_URL kosong atau server Redis
 * tidak dapat dihubungi, seluruh pemanggilan di bawah langsung mengembalikan
 * "tidak ada cache" dan situs tetap jalan seperti biasa (hanya lebih lambat).
 * Jangan pernah melempar error ke pemanggil dari modul ini.
 */

type Klien = ReturnType<typeof createClient>;

let klien: Klien | null = null;
let percobaan: Promise<Klien | null> | null = null;
let terakhirGagal = 0;
const JEDA_COBA_LAGI = 30_000; // jangan menghubungi Redis terus-menerus bila mati

function alamat(): string {
  return (process.env.REDIS_URL ?? "").trim();
}

async function ambilKlien(): Promise<Klien | null> {
  const url = alamat();
  if (!url) return null;
  if (klien?.isReady) return klien;
  if (klien && !klien.isOpen) klien = null;
  if (Date.now() - terakhirGagal < JEDA_COBA_LAGI) return null;

  if (!percobaan) {
    percobaan = (async () => {
      try {
        const c = createClient({
          url,
          socket: {
            connectTimeout: 3_000,
            reconnectStrategy: (n: number) => (n > 5 ? false : Math.min(n * 300, 2_000)),
          },
        });
        c.on("error", (e: unknown) => {
          console.error("[redis]", (e as Error)?.message ?? e);
        });
        await c.connect();
        klien = c;
        return c;
      } catch (e) {
        terakhirGagal = Date.now();
        console.error("[redis] gagal konek:", (e as Error).message);
        klien = null;
        return null;
      } finally {
        percobaan = null;
      }
    })();
  }
  return percobaan;
}

/** Ambil nilai string dari cache. `null` bila tidak ada / Redis mati. */
export async function cacheAmbil(kunci: string): Promise<string | null> {
  try {
    const c = await ambilKlien();
    if (!c) return null;
    return await c.get(kunci);
  } catch (e) {
    terakhirGagal = Date.now();
    console.error("[redis] gagal baca:", (e as Error).message);
    return null;
  }
}

/** Simpan nilai string ke cache dengan TTL detik. Gagal = diabaikan. */
export async function cacheSimpan(kunci: string, nilai: string, ttlDetik: number): Promise<boolean> {
  try {
    const c = await ambilKlien();
    if (!c) return false;
    await c.set(kunci, nilai, { EX: Math.max(1, Math.floor(ttlDetik)) });
    return true;
  } catch (e) {
    terakhirGagal = Date.now();
    console.error("[redis] gagal simpan:", (e as Error).message);
    return false;
  }
}

/** Hapus satu atau beberapa kunci. Dipakai saat admin menyimpan data. */
export async function cacheHapus(...kunci: string[]): Promise<void> {
  if (kunci.length === 0) return;
  try {
    const c = await ambilKlien();
    if (!c) return;
    await c.del(kunci);
  } catch (e) {
    terakhirGagal = Date.now();
    console.error("[redis] gagal hapus:", (e as Error).message);
  }
}

/** Status singkat untuk header respons / diagnosa. */
export function statusCache(): "redis" | "off" {
  return klien?.isReady ? "redis" : "off";
}
