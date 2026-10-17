import type { MetadataRoute } from "next";

const SITE_URL = "https://ramonlummertz.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/palestra`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
