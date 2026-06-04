import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Reference",
  description: "TrackHive REST API reference — authentication, endpoints, rate limits, and code examples.",
  alternates: { canonical: "https://trackhive.io/api-reference" },
  openGraph: { title: "API Reference — TrackHive", description: "REST API reference — endpoints, auth, and code examples." },
}

export default function ApiReferenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
