import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to get started with TrackHive — guides, API reference, and integrations.",
  alternates: { canonical: "https://trackhive.io/docs" },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
