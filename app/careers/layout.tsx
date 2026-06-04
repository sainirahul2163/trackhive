import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers — Join the Team",
  description: "Help build the future of UGC marketing. View open roles at TrackHive.",
  alternates: { canonical: "https://trackhive.io/careers" },
  openGraph: { title: "Careers — TrackHive", description: "Help build the future of UGC marketing." },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
