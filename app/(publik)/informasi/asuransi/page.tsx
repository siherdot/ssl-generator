import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/page-header";
import { getPenjamin, gambar } from "@/lib/data";

export const metadata: Metadata = {
  title: "Asuransi & Penjamin",
  description:
    "Daftar rekanan asuransi dan penjamin yang bekerja sama dengan RSU Mahkota Bidadari.",
};

export const dynamic = "force-dynamic";

/** Inisial nama penjamin untuk kartu tanpa logo (maks 3 huruf). */
function inisial(nama: string) {
  const kata = nama
    .replace(/\(.*?\)/g, " ")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((k) => k.length > 1 && !/^(pt|tbk|persero|cabang|indonesia)$/i.test(k));
  if (kata.length === 0) return nama.slice(0, 2).toUpperCase();
  if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
  return kata
    .slice(0, 3)
    .map((k) => k[0])
    .join("")
    .toUpperCase();
}

/** Warna latar monogram, dipilih stabil dari nama. */
const WARNA = [
  "bg-brand-900 text-white",
  "bg-brand-800 text-white",
  "bg-brand-700 text-white",
  "bg-brand text-brand-900",
  "bg-lime text-brand-900",
  "bg-mint text-brand-900",
];

function warna(nama: string) {
  let h = 0;
  for (let i = 0; i < nama.length; i++) h = (h * 31 + nama.charCodeAt(i)) % 997;
  return WARNA[h % WARNA.length];
}

export default async function AsuransiPage() {
  const daftar = await getPenjamin();
  const kategori = [...new Set(daftar.map((d) => d.kategori))];

  return (
    <>
      <PageHeader
        eyebrow="Pusat Informasi"
        title="Asuransi & Penjamin"
        description={`${daftar.length} rekanan asuransi, TPA, dan korporat yang bekerja sama dengan RSU Mahkota Bidadari.`}
        crumbs={[
          { label: "Pusat Informasi", href: "/informasi" },
          { label: "Asuransi & Penjamin" },
        ]}
      />

      <section className="container-page py-8">
        {daftar.length === 0 ? (
          <p className="text-sm text-muted">Daftar rekanan belum tersedia.</p>
        ) : (
          <div className="space-y-10">
            {kategori.map((kat) => {
              const isi = daftar.filter((d) => d.kategori === kat);
              return (
                <div key={kat}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">
                      {kat}
                    </h2>
                    <span className="text-xs text-muted">{isi.length} penjamin</span>
                  </div>

                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {isi.map((d) => (
                      <li
                        key={d.id}
                        className="card-hover flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white px-3 py-4 text-center shadow-[var(--shadow-card)]"
                      >
                        <div className="relative flex h-16 w-full items-center justify-center overflow-hidden">
                          {d.logo ? (
                            <Image
                              src={gambar(d.logo)}
                              alt={d.nama}
                              width={150}
                              height={64}
                              sizes="150px"
                              className="max-h-16 w-auto object-contain"
                            />
                          ) : (
                            <span
                              className={`flex h-14 w-14 items-center justify-center rounded-xl text-base font-bold tracking-wide ${warna(
                                d.nama
                              )}`}
                              aria-hidden="true"
                            >
                              {inisial(d.nama)}
                            </span>
                          )}
                        </div>
                        <span className="line-clamp-2 text-[13px] font-medium leading-snug text-brand-900">
                          {d.nama}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-mist p-5 text-sm text-muted">
              <p className="font-semibold text-brand-900">Cara menggunakan asuransi</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Pastikan polis/kartu peserta masih aktif.</li>
                <li>Bawa kartu asuransi dan identitas saat mendaftar.</li>
                <li>
                  Untuk kasus tertentu mungkin diperlukan surat jaminan atau rujukan dari kantor
                  penjamin — konfirmasi ke call center penjamin sebelum datang.
                </li>
              </ol>
              <p className="mt-3 text-xs">
                Daftar dapat berubah sewaktu-waktu. Bila penjamin Anda tidak tercantum,
                hubungi pendaftaran di (061) 8830003.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
