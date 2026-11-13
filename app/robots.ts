import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin", "/_next/"],
      },
    ],
    sitemap: "https://rsu.mahkotabidadari.com/sitemap.xml",
    host: "https://rsu.mahkotabidadari.com",
  };
}
