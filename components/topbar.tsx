import { site } from "@/lib/site";

export default function Topbar() {
  return (
    <div className="bg-gradient-to-r from-brand-900 to-brand-700 text-white">
      <div className="flex w-full flex-col gap-1 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-[13px] lg:px-8 2xl:px-12">
        <p className="flex items-start gap-2 text-white/85">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
            <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="leading-snug">{site.address}</span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-1.5 hover:text-brand-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
            </svg>
            {site.phone}
          </a>
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-brand-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20Zm4.5-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6a9 9 0 0 0 3.5 3.1c1.5.6 2 .6 2.7.5.4-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.1Z" />
            </svg>
            {site.whatsappLabel}
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">WA</span>
          </a>
          <span className="hidden items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide sm:flex">
            IGD 24 Jam
          </span>
        </div>
      </div>
    </div>
  );
}
