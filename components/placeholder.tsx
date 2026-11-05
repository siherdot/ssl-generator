import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  parent?: { label: string; href: string };
};

/**
 * Kerangka halaman untuk Fase A.
 * Dipakai supaya menu tidak 404 sebelum isi sebenarnya diisi di Fase B/C.
 */
export default function Placeholder({ eyebrow, title, description, parent }: Props) {
  return (
    <section className="container-page py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-800">Beranda</Link>
        {parent && (
          <>
            <span className="mx-2">/</span>
            <Link href={parent.href} className="hover:text-brand-800">{parent.label}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">{eyebrow}</p>
      <h1 className="section-title mt-2 text-3xl lg:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted lg:text-base">{description}</p>

      <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-brand/50 bg-brand/10 p-6">
        <p className="text-sm font-semibold text-brand-900">Halaman ini diisi pada fase berikutnya</p>
        <p className="mt-1 text-sm text-muted">
          Struktur, navigasi, dan desain sudah final. Isi data akan diambil langsung dari database
          RSU Mahkota Bidadari, bukan diketik manual.
        </p>
      </div>
    </section>
  );
}
