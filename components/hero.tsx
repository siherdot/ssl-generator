import Link from "next/link";
import SlideLatar from "@/components/slide-latar";
import { site } from "@/lib/site";

export default function Hero({ fotoLatar = [] }: { fotoLatar?: string[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
      {fotoLatar.length > 0 && <SlideLatar foto={fotoLatar} />}
      {fotoLatar.length === 0 && (
        <>
          {/* ornamen lembut, bukan foto acuan */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(900px 400px at 85% -10%, rgba(186,229,53,0.30), transparent 60%), radial-gradient(700px 320px at 10% 110%, rgba(5,169,25,0.35), transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #ffffff 0 1px, transparent 1px 14px)",
            }}
          />
        </>
      )}

      <div
        className={`container-page relative py-14 lg:py-20 ${
          fotoLatar.length > 0 ? "[text-shadow:0_1px_16px_rgba(6,44,12,0.55)]" : ""
        }`}
      >
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-700" />
          Sejak {site.founded} · Langkat
        </p>

        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {site.slogan}
        </h1>
        <p className="mt-4 max-w-4xl text-[15px] leading-relaxed text-white/95 lg:text-[17px]">
          Layanan UGD 24 jam, rawat jalan, rawat inap, dan penunjang medis dengan tenaga kesehatan profesional di Kabupaten Langkat, Sumatera Utara.
        </p>

        {/* pencarian — Fase B disambungkan ke data dokter */}
        <form action="/dokter" className="mt-8 max-w-3xl">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center">
            <label htmlFor="q" className="sr-only">
              Cari dokter atau layanan
            </label>
            <div className="flex flex-1 items-center gap-2 px-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="q"
                name="q"
                type="search"
                placeholder="Cari dokter atau layanan…"
                className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/daftar-online"
            className="rounded-lg bg-sun px-5 py-2.5 font-semibold text-brand-900 transition-opacity hover:opacity-90"
          >
            Buat Janji
          </Link>
          <a
            href={`tel:${site.igd.replace(/[^0-9+]/g, "")}`}
            className="rounded-lg border border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10"
          >
            IGD {site.igd}
          </a>
        </div>
      </div>
    </section>
  );
}
