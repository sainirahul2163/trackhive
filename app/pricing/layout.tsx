import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"

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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is there a free trial?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — every plan includes a 7-day free trial. No credit card required." },
    },
    {
      "@type": "Question",
      name: "Can I switch plans later?",
      acceptedAnswer: { "@type": "Answer", text: "Absolutely. You can upgrade or downgrade at any time from Settings → Billing." },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: { "@type": "Answer", text: "We accept all major credit cards via Stripe. Annual plans can also be paid by bank transfer on request." },
    },
    {
      "@type": "Question",
      name: "Are there setup fees?",
      acceptedAnswer: { "@type": "Answer", text: "No. There are no setup fees, onboarding fees, or hidden charges." },
    },
    {
      "@type": "Question",
      name: "What is white-labelling?",
      acceptedAnswer: { "@type": "Answer", text: "Agency plan users can set a custom subdomain (e.g. analytics.youragency.com), upload their logo, and use their brand colours. Clients see your brand, not TrackHive." },
    },
    {
      "@type": "Question",
      name: "Do you offer discounts?",
      acceptedAnswer: { "@type": "Answer", text: "Annual plans save 20% vs monthly. We also offer custom pricing for very large deployments — email sales@trackhive.io." },
    },
  ],
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  )
}
