import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — Simple, Transparent Plans",
  description: "Start at $49/mo. White-label for agencies at $299/mo. 7-day free trial. No credit card required.",
  openGraph: {
    title:       "TrackHive Pricing — Simple, Transparent Plans",
    description: "Start free. Scale as you grow.",
    images: [{ url: "/og?title=TrackHive+Pricing&description=Start+free.+Scale+as+you+grow.", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "TrackHive Pricing",
    description: "Start free. Scale as you grow.",
    images:      ["/og?title=TrackHive+Pricing&description=Start+free.+Scale+as+you+grow."],
  },
  alternates: { canonical: "https://trackhive.io/pricing" },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
