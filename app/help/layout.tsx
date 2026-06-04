import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to common questions, troubleshoot issues, and contact TrackHive support.",
  alternates: { canonical: "https://trackhive.io/help" },
  openGraph: { title: "Help Center — TrackHive", description: "Find answers, troubleshoot, and contact support." },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
