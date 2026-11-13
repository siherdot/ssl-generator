import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { bacaBahasa } from "@/lib/i18n-server";
import { site } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await bacaBahasa();
  const kota = "Kabupaten Langkat";
  return {
  alternates: { canonical: "./" },
  metadataBase: new URL("https://rsu.mahkotabidadari.com"),
  title: {
    default: lang === "en" ? `${site.name} — General Hospital in ${kota}` : `${site.name} — Rumah Sakit Umum di ${kota}`,
    template: `%s | ${site.name}`,
  },
  description:
    lang === "en"
      ? `${site.name} provides 24-hour emergency care, outpatient and inpatient services, and medical support in Langkat Regency, North Sumatra.`
      : `${site.name} melayani UGD 24 jam, rawat jalan, rawat inap, dan penunjang medis di Kabupaten Langkat, Sumatera Utara.`,
  keywords: [
    "rumah sakit langkat",
    "RSU Mahkota Bidadari",
    "UGD 24 jam langkat",
    "jadwal dokter langkat",
    "rawat inap langkat",
  ],
  openGraph: {
    type: "website",
    url: "./",
    locale: lang === "en" ? "en_US" : "id_ID",
    siteName: site.name,
    title: lang === "en" ? `${site.name} — General Hospital in ${kota}` : `${site.name} — Rumah Sakit Umum di ${kota}`,
    description: site.slogan,
    images: [
      { url: "/images/og-rsumb.jpg", width: 1200, height: 630, alt: `${site.name} — rumah sakit di Kabupaten Langkat` },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    // route dinamis: ikon mengikuti unggahan di dashboard (logo & ikon tab)
    icon: [{ url: "/api/identitas/ikon", type: "image/png" }],
    shortcut: "/api/identitas/ikon",
    apple: "/api/identitas/ikon",
  },
  robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b8f1b",
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout sengaja hanya berisi html/body + font.
 * Kerangka situs publik (topbar, navbar, footer) ada di app/(publik)/layout.tsx,
 * sedangkan dashboard admin punya kerangka sendiri di app/admin.
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await bacaBahasa();
  return (
    <html lang={lang} className={poppins.variable}>
      <body className="font-[family-name:var(--font-poppins)] antialiased">{children}</body>
    </html>
  );
}
