import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to get started with TrackHive — guides, API reference, and integrations.",
  openGraph: {
    title:       "TrackHive Docs",
    description: "Everything you need to get started.",
    images: [{ url: "/og?title=TrackHive+Docs&description=Everything+you+need+to+get+started", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "TrackHive Docs",
    description: "Everything you need to get started.",
    images:      ["/og?title=TrackHive+Docs&description=Everything+you+need+to+get+started"],
  },
  alternates: { canonical: "https://trackhive.io/docs" },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
