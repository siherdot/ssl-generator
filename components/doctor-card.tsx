import Image from "next/image";
import Link from "next/link";
import { bacaBahasa } from "@/lib/i18n-server";
import { namaHari, t } from "@/lib/i18n";
import { dua, tx } from "@/lib/teks-en";
import { gambar, jamRapi, pecahHari, type Dokter } from "@/lib/data";

export default async function DoctorCard({ dokter }: { dokter: Dokter }) {
  const lang = await bacaBahasa();
  // gabungkan semua hari praktik, urutkan sesuai urutan hari (bukan alfabetis)
  const URUT = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu"];
  const hariUnik = [
    ...new Set((dokter.jadwal ?? []).flatMap((j) => pecahHari(j.hari))),
  ].sort((a, b) => URUT.indexOf(a) - URUT.indexOf(b));
  const jamList = (dokter.jadwal ?? []).slice(0, 2).map((j) => {
    const [awal, akhir] = j.jam.split("-");
    return `${jamRapi(awal)}–${jamRapi(akhir)}`;
  });

  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-mist ring-1 ring-line lg:h-28 lg:w-28">
          <Image
            src={gambar(dokter.images)}
            alt={`Foto ${dokter.nama_dokter}`}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-brand-900">{dokter.nama_dokter}</h3>
          {dokter.nama_poli ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-800">
              {dua(lang, dokter.nama_poli, dokter.nama_poli_en)}
            </p>
          ) : (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-800">
              Dokter Spesialis
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-line px-4 py-3">
        {hariUnik.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {hariUnik.map((h) => (
              <span key={h} className="rounded bg-mist px-2 py-0.5 text-[11px] font-medium text-ink">
                {namaHari(lang, h)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted">Jadwal belum tersedia — hubungi pendaftaran</p>
        )}

        {jamList.length > 0 && (
          <p className="mt-2 text-[11px] font-semibold text-brand-800">
            {jamList.join(" · ")}
            {(dokter.jadwal?.length ?? 0) > 2 && (
              <span className="font-normal text-muted"> · +{(dokter.jadwal!.length - 2)} {lang === "en" ? "more schedules" : "jadwal lain"}</span>
            )}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/dokter/${encodeURIComponent(dokter.id_dokter)}`}
            className="text-sm font-semibold text-brand-800 hover:underline"
          >
            {t(lang, "umum.lihatProfil")}
          </Link>
          <Link
            href="/daftar-online"
            className="rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
          >
            {lang === "en" ? "Register" : "Daftar"}
          </Link>
        </div>
      </div>
    </article>
  );
}
