import type { MetadataRoute } from "next"

const BASE = "https://trackhive.io"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:              `${BASE}/`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         1.0,
    },
    {
      url:              `${BASE}/pricing`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.9,
    },
    {
      url:              `${BASE}/demo`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.9,
    },
    {
      url:              `${BASE}/blog`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.8,
    },
    {
      url:              `${BASE}/docs`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.8,
    },
    {
      url:              `${BASE}/changelog`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.7,
    },
    {
      url:              `${BASE}/api-reference`,
      lastModified:     new Date(),
      changeFrequency:  "weekly",
      priority:         0.7,
    },
    {
      url:              `${BASE}/about`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.7,
    },
    {
      url:              `${BASE}/careers`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.6,
    },
    {
      url:              `${BASE}/press`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.6,
    },
    {
      url:              `${BASE}/status`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.5,
    },
  ]
}
