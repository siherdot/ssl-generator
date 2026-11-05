import { site } from "@/lib/site";

/** Data terstruktur schema.org untuk rumah sakit (membantu Google). */
export function JsonLdHospital() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: site.name,
    url: "https://rsub.rsumb.site",
    logo: "https://rsub.rsumb.site/images/logo-rsub.png",
    image: "https://rsub.rsumb.site/images/logo-rsub.png",
    description:
      "Rumah sakit umum di Kabupaten Langkat dengan layanan UGD 24 jam, rawat jalan spesialis, rawat inap, dan penunjang medis.",
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Sisingamangaraja No. 146, Desa Paluh Manis, Kec. Gebang",
      addressLocality: "Gebang",
      addressRegion: "Sumatera Utara",
      postalCode: "20746",
      addressCountry: "ID",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
        description: "IGD 24 jam",
      },
    ],
    medicalSpecialty: [
      "Emergency",
      "InternalMedicine",
      "Pediatric",
      "Surgical",
      "Obstetric",
      "Ophthalmologic",
      "Dermatology",
      "Otolaryngologic",
      "Neurologic",
      "Radiography",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // data statis, tidak berasal dari input pengguna
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Data terstruktur untuk halaman dokter. */
export function JsonLdDokter({
  nama,
  poli,
  gambar,
  url,
}: {
  nama: string;
  poli?: string;
  gambar: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: nama,
    medicalSpecialty: poli,
    image: gambar,
    url,
    worksFor: {
      "@type": "Hospital",
      name: "RSU Mahkota Bidadari",
      url: "https://rsub.rsumb.site",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
