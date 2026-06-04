import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Start Free Trial — 7 Days Free",
  description: "Create your TrackHive account. No credit card required. Start tracking creators in minutes.",
  openGraph: {
    title:       "Start Your Free Trial — TrackHive",
    description: "7 days free. No card required.",
    images: [{ url: "/og?title=Start+Free+Trial&description=7+days+free.+No+card+required.", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "Start Free Trial — TrackHive",
    description: "7 days free. No card required.",
    images:      ["/og?title=Start+Free+Trial&description=7+days+free.+No+card+required."],
  },
  alternates: { canonical: "https://trackhive.io/signup" },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
