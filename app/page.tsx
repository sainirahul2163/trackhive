import type { Metadata } from "next"
import { Navbar } from "@/components/marketing/navbar"

export const metadata: Metadata = {
  title: "TrackHive — UGC Analytics & Campaign Management",
  description: "Track every creator. Manage campaigns. Pay results. Zero spreadsheets.",
  openGraph: {
    title:       "TrackHive — UGC Analytics & Campaign Management",
    description: "Track every creator. Manage campaigns. Pay results. Zero spreadsheets.",
    images: [{ url: "/og?title=TrackHive+%E2%80%94+UGC+Analytics&description=Track+every+creator.+Pay+results.", width: 1200, height: 630 }],
  },
  twitter: {
    title:       "TrackHive — UGC Analytics & Campaign Management",
    description: "Track every creator. Manage campaigns. Pay results.",
    images:      ["/og?title=TrackHive+%E2%80%94+UGC+Analytics&description=Track+every+creator.+Pay+results."],
  },
  alternates: { canonical: "https://trackhive.io" },
}
import { Hero } from "@/components/marketing/hero"
import { SocialProof } from "@/components/marketing/social-proof"
import { Features } from "@/components/marketing/features"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Pricing } from "@/components/marketing/pricing"
import { Testimonials } from "@/components/marketing/testimonials"
import { FAQ } from "@/components/marketing/faq"
import { CTAAndFooter } from "@/components/marketing/cta-footer"

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <CTAAndFooter />
    </div>
  )
}
