import Link from "next/link";
import { quickActions } from "@/lib/site";

const icons: Record<string, React.ReactNode> = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 3v6a4 4 0 0 0 8 0V3" />
      <path d="M10 13v3a5 5 0 0 0 8 0" />
      <circle cx="19" cy="13" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18v-5a2 2 0 0 1 2-2h11a4 4 0 0 1 4 4v3" />
      <path d="M3 18h18M3 21v-3M21 21v-3" />
      <circle cx="8" cy="9" r="2" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2.5" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </>
  ),
};

export default function QuickActions() {
  return (
    <section className="relative z-10 -mt-8 pb-4" aria-label="Aksi cepat">
      <div className="container-page">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <li key={action.title}>
              <Link
                href={action.href}
                className="card-hover flex h-full items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand-800">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    {icons[action.icon]}
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-brand-900">{action.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
