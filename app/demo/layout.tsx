import type { Metadata } from "next"
import { DemoShell } from "@/components/demo/demo-shell"

export const metadata: Metadata = {
  title: "Live Demo — See TrackHive in Action",
  description: "Try TrackHive free. No signup required. See real analytics, campaigns, and payments.",
  openGraph: {
    title:       "Try TrackHive Demo — No Signup Required",
    description: "See real analytics, campaigns, and payments. No signup required.",
    images: [{ url: "/og?title=Try+TrackHive+Demo&description=No+signup+required.", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "Try TrackHive Demo",
    description: "No signup required.",
    images:      ["/og?title=Try+TrackHive+Demo&description=No+signup+required."],
  },
  robots: { index: true, follow: true },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>
}
