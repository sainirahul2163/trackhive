import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers — Join the Team",
  description: "Help build the future of UGC marketing. View open roles at TrackHive.",
  openGraph: {
    title:       "Careers at TrackHive",
    description: "Help us build the future of UGC marketing.",
    images: [{ url: "/og?title=Careers+at+TrackHive&description=Help+us+build+the+future+of+UGC+marketing", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "Careers at TrackHive",
    description: "Help us build the future of UGC marketing.",
    images:      ["/og?title=Careers+at+TrackHive&description=Help+us+build+the+future+of+UGC+marketing"],
  },
  alternates: { canonical: "https://trackhive.io/careers" },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
