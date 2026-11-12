import Link from "next/link";
import { bacaBahasa } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

type Crumb = { label: string; href?: string };

export default async function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  const lang = await bacaBahasa();
  return (
    <section className="border-b border-line bg-mist">
      <div className="container-page py-8 lg:py-10">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <Link href="/" className="hover:text-brand-800">{t(lang, "umum.beranda")}</Link>
            {crumbs.map((c) => (
              <span key={c.label}>
                <span className="mx-2">/</span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-brand-800">{c.label}</Link>
                ) : (
                  <span className="text-ink">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">{eyebrow}</p>
        )}
        <h1 className="section-title mt-2 text-2xl lg:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted lg:text-base">{description}</p>
        )}
      </div>
    </section>
  );
}
