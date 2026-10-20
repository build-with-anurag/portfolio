import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://anurag-portfolio-rho-ten.vercel.app/",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
