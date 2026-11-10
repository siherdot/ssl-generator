import "server-only";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";

/**
 * Klien API Eksternal SIMRS untuk dipakai di server (bukan browser).
 * SIMRS memakai sertifikat self-signed di IP LAN, jadi verifikasi TLS
 * dimatikan khusus panggilan ini.
 */
const SUMBER = (process.env.SIMRS_API_URL ?? "").replace(/\/$/, "");
const KUNCI = process.env.SIMRS_API_KEY ?? "";

export async function simrsAmbil<T = unknown>(path: string): Promise<T> {
  if (!SUMBER || !KUNCI) {
    throw new Error("SIMRS_API_URL / SIMRS_API_KEY belum diisi di environment.");
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
