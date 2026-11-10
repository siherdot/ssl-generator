import "server-only";

/** kelas SIMRS -> pilihan kelas di dashboard */
const KELAS: Record<string, string> = {
  "NICU & INCUBATOR": "NICU",
  VIP: "VIP",
  SATU: "I",
  DUA: "II",
  TIGA: "III",
  HCU: "HCU",
  BAYI: "Bayi",
  ICU: "ICU",
  "RUANG ISOLASI": "Isolasi",
  "ICU ISOLASI": "Isolasi",
};

export type UnitKasur = {
  nama_unit: string;
  kelas: string;
  total: number;
  terisi: number;
  keterangan: string;
  urutan: number;
};

/** Terjemahkan respons /bed-display SIMRS jadi bentuk yang diterima POST /api/simrs/kasur. */
export function unitDariBedDisplay(data: { per_ruang?: Record<string, unknown>[] }): UnitKasur[] {
  const ruang = Array.isArray(data.per_ruang) ? data.per_ruang : [];
  return ruang.map((r, i) => {
    const kelas = String(r.kelas ?? "");
    return {
      nama_unit: String(r.namaruang ?? ""),
      kelas: KELAS[kelas.toUpperCase()] ?? kelas.slice(0, 40),
      total: Number(r.kapasitas ?? 0),
      terisi: Number(r.terisi ?? 0),
      keterangan: String(r.bangsal ?? ""),
      urutan: i + 1,
    };
  });
}
