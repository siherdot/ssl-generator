/**
 * Peta lokasi RS memakai embed Google Maps (bisa digeser & di-zoom).
 * Satu sumber URL untuk semua tempat, supaya tidak ada salinan berbeda.
 */
const SRC =
  "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d497.52818870499345!2d98.34769460209664!3d3.973937762320717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sid!2sid!4v1794383142055!5m2!1sid!2sid";

export default function PetaEmbed({
  judul = "Peta lokasi RSU Mahkota Bidadari",
  tinggi = "h-[240px] lg:h-[320px]",
}: {
  judul?: string;
  tinggi?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
      <iframe
        src={SRC}
        title={judul}
        className={`w-full border-0 ${tinggi}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
