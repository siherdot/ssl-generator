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
    sitemap: "https://rsub.rsumb.site/sitemap.xml",
    host: "https://rsub.rsumb.site",
  };
}
