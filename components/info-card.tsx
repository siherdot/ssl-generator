import Image from "next/image";
import Link from "next/link";

export default function InfoCard({
  title,
  description,
  image,
  href,
  badge,
  ctaLabel = "Selengkapnya",
  rasio = "aspect-[16/10]",
  muat = "object-cover",
  autoRasio = false,
  latarBlur = false,
}: {
  title: string;
  description?: string;
  image: string;
  href?: string;
  badge?: string;
  ctaLabel?: string;
  /** rasio area gambar, mis. "aspect-[4/5]" untuk poster */
  rasio?: string;
  /** object-cover (penuhi) atau object-contain (gambar utuh) */
  muat?: "object-cover" | "object-contain";
  /**
   * true: tinggi gambar mengikuti rasio asli berkas (tidak dipotong, tanpa
   * ruang kosong). Dipakai untuk poster berita/poliklinik yang rasionya beda-beda.
   */
  autoRasio?: boolean;
  /**
   * true: kotak seragam (pakai `rasio`), poster ditampilkan utuh (contain)
   * di atas bayangan buram poster itu sendiri — rapi dan tidak terpotong.
   */
  latarBlur?: boolean;
}) {
  const body = (
    <>
      <div className={`w-full overflow-hidden bg-mist ${autoRasio ? "" : `relative ${rasio}`}`}>
        {latarBlur ? (
          <>
            {/* bayangan buram dari gambar yang sama, mengisi sisa kotak */}
            <Image
              src={image}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="scale-110 object-cover opacity-70 blur-lg"
            />
            <div className="absolute inset-0 bg-brand-900/10" aria-hidden />
            {/* poster utuh */}
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="z-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </>
        ) : autoRasio ? (
          <Image
            src={image}
            alt={title}
            width={0}
            height={0}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
            className="h-auto w-full"
          />
        ) : (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`${muat} transition-transform duration-300 group-hover:scale-[1.02]`}
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded bg-brand-900/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-brand-900 lg:text-[15px]">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">{description}</p>
        )}
        {href && (
          <span className="mt-4 text-xs font-semibold text-brand-800 group-hover:underline">{ctaLabel} →</span>
        )}
      </div>
    </>
  );

  const className =
    "group card-hover flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]";

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <article className={className}>{body}</article>
  );
}
