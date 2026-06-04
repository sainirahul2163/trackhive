import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:  "Creator Analytics",
    robots: { index: false, follow: false },
  }
}

export default function AnalyticsDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
