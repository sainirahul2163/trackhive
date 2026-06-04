import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to common questions, troubleshoot issues, and contact TrackHive support.",
  openGraph: {
    title:       "Help Center — TrackHive",
    description: "Find answers, troubleshoot, and contact support.",
    images: [{ url: "/og?title=TrackHive+Help+Center&description=Guides+and+support+for+TrackHive", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trackhive.io/help" },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I add a creator without them logging in?",
      acceptedAnswer: { "@type": "Answer", text: "TrackHive tracks creators using their public profile URLs — no creator login or API access required. Just paste a TikTok, Instagram, YouTube, or Facebook profile URL and we'll start tracking automatically." },
    },
    {
      "@type": "Question",
      name: "How accurate is the analytics data?",
      acceptedAnswer: { "@type": "Answer", text: "TrackHive pulls from public data sources. View counts, follower numbers, and engagement metrics are accurate within the last sync window (typically every 6–24 hours depending on your plan). Real-time data is not available." },
    },
    {
      "@type": "Question",
      name: "Can I connect my own Slack for notifications?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Go to Settings → Integrations → Slack and click 'Connect Slack'. You can configure which event types trigger Slack notifications (campaign milestones, payment events, competitor spikes, etc.)." },
    },
    {
      "@type": "Question",
      name: "How do creator payouts work?",
      acceptedAnswer: { "@type": "Answer", text: "You define payout rules (base fee + CPM rate + milestone bonus) per campaign. When a creator hits a threshold, TrackHive queues a payout for your approval. Once approved, payment is sent via the creator's chosen method (PayPal, Wise, bank transfer)." },
    },
    {
      "@type": "Question",
      name: "Can I white-label TrackHive for my clients?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — white-labelling is available on the Agency plan. You can set a custom subdomain, upload your logo, use your brand colours, and customise the email sender name. Your clients will see your branding, not TrackHive." },
    },
    {
      "@type": "Question",
      name: "What's the difference between the plans?",
      acceptedAnswer: { "@type": "Answer", text: "Starter ($49/mo) covers 1,000 videos and 10 creators. Pro ($149/mo) covers 5,000 videos, 100 creators, and unlocks API access. Agency ($299/mo) covers 20,000 videos, 500 creators, and includes white-labelling. All plans include a 7-day free trial." },
    },
    {
      "@type": "Question",
      name: "Can I cancel anytime?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can cancel your subscription from Settings → Billing at any time. You'll retain access until the end of your current billing period — no partial refunds are issued for unused time." },
    },
    {
      "@type": "Question",
      name: "How do I export data?",
      acceptedAnswer: { "@type": "Answer", text: "CSV export is available on Pro and Agency plans. Click the Export button on any analytics, campaign, or payout table. You can also access raw data via the API (Pro and above)." },
    },
  ],
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  )
}
