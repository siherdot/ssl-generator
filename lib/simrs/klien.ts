import "server-only";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { one } from "@/lib/db";

/**
 * Klien API Eksternal SIMRS untuk dipakai di server (bukan browser).
 * SIMRS memakai sertifikat self-signed di IP LAN, jadi verifikasi TLS
 * dimatikan khusus panggilan ini.
 */
type Setelan = { api_url: string; api_key: string };

/** URL & API key diambil dari dashboard admin; env hanya cadangan. */
async function setelan(): Promise<Setelan> {
  const cadangan = {
    api_url: (process.env.SIMRS_API_URL ?? "").replace(/\/$/, ""),
    api_key: process.env.SIMRS_API_KEY ?? "",
  };

  try {
    const baris = await one<Setelan>("SELECT api_url, api_key FROM pengaturan_simrs WHERE id = 1");
    const url = (baris?.api_url ?? "").trim();
    const kunci = (baris?.api_key ?? "").trim();
    if (url && kunci) return { api_url: url.replace(/\/$/, ""), api_key: kunci };
  } catch {
    /* tabel belum dimigrasi — pakai env */
  }

  return cadangan;
}

export async function simrsAmbil<T = unknown>(path: string): Promise<T> {
  const { api_url: SUMBER, api_key: KUNCI } = await setelan();
  if (!SUMBER || !KUNCI) {
    throw new Error(
      "URL API dan API key SIMRS belum diisi (Dashboard → Pengaturan → Koneksi SIMRS)."
    );
  }

  const url = new URL(SUMBER + path);
  const buka = url.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise<T>((selesai, gagal) => {
    const req = buka(
      url,
      {
        method: "GET",
        headers: { "X-API-Key": KUNCI, Accept: "application/json" },
        timeout: 20_000,
        ...(url.protocol === "https:" ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        let isi = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (isi += c));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return gagal(new Error(`SIMRS ${path} -> HTTP ${res.statusCode}`));
          }
          try {
            const json = JSON.parse(isi) as { response?: T };
            selesai((json.response ?? json) as T);
          } catch {
            gagal(new Error(`SIMRS ${path} -> respons bukan JSON`));
          }
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error(`SIMRS ${path} -> timeout`)));
    req.on("error", gagal);
    req.end();
  });
}
