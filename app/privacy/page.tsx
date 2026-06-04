import type { Metadata } from "next"
import Link from "next/link"
import { Zap, ArrowLeft, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TrackHive collects, uses, and protects your data. Last updated 2025.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://trackhive.io/privacy" },
}

const LAST_UPDATED = "June 1, 2025"

interface Section {
  title: string
  content: string[]
}

const SECTIONS: Section[] = [
  {
    title: "1. Information We Collect",
    content: [
      "Account information: When you register, we collect your name, email address, company name, and payment information.",
      "Usage data: We automatically collect information about how you use the Service — pages visited, features used, session duration, and device/browser metadata.",
      "Creator data you add: When you add creator profiles to TrackHive, we store the public profile data you submit (e.g. platform handle, follower counts, video metrics). This data is sourced from publicly available information.",
      "Communications: If you contact us via email or chat, we retain those communications to assist with support.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide and improve the Service — processing your requests, personalising your experience, and developing new features.",
      "To manage your account and subscription — billing, authentication, and account security.",
      "To send transactional communications — receipts, password resets, and important service updates. You cannot opt out of these.",
      "To send marketing emails — product news and tips. You may opt out at any time via the unsubscribe link in each email.",
      "To enforce our Terms of Service and prevent fraud or abuse.",
    ],
  },
  {
    title: "3. How We Share Your Information",
    content: [
      "We do not sell your personal data to third parties.",
      "Service providers: We share data with trusted vendors who process it on our behalf (e.g. payment processors like Stripe, cloud hosting providers, analytics tools). These providers are contractually required to protect your data.",
      "Legal requirements: We may disclose your data if required by law, court order, or to protect the rights and safety of TrackHive or its users.",
      "Business transfers: If TrackHive is acquired or merges with another company, your data may be transferred as part of that transaction. We will notify you before this occurs.",
    ],
  },
  {
    title: "4. Creator Data & Third-Party Platforms",
    content: [
      "TrackHive collects publicly available creator data from social platforms (TikTok, Instagram, YouTube, Facebook). We are not affiliated with these platforms and operate independently of their APIs where legally permitted.",
      "You are responsible for ensuring that your use of creator data within TrackHive complies with applicable privacy laws and the relevant platform's terms of service.",
      "If a creator requests removal of their data from TrackHive, please contact us at privacy@trackhive.io and we will process the request within 30 days.",
    ],
  },
  {
    title: "5. Data Retention",
    content: [
      "We retain your account data for as long as your account is active. If you cancel your subscription, we retain your data for 90 days to allow account recovery, after which it is deleted.",
      "Anonymised usage data may be retained indefinitely for product analytics purposes.",
      "You may request deletion of your account and associated data at any time by emailing privacy@trackhive.io.",
    ],
  },
  {
    title: "6. Cookies & Tracking",
    content: [
      "We use strictly necessary cookies for authentication and session management. These cannot be disabled without breaking core functionality.",
      "We use analytics cookies (e.g. Posthog or Mixpanel) to understand how users interact with the Service. You may opt out of analytics tracking via your account settings.",
      "We do not use third-party advertising cookies or sell your browsing data to ad networks.",
    ],
  },
  {
    title: "7. Security",
    content: [
      "We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and regular security audits.",
      "While we take security seriously, no system is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication when available.",
      "In the event of a data breach that affects your personal data, we will notify you within 72 hours as required by applicable law.",
    ],
  },
  {
    title: "8. Your Rights",
    content: [
      "Depending on your location, you may have the following rights regarding your personal data:",
      "• Access — request a copy of the data we hold about you.",
      "• Correction — request correction of inaccurate data.",
      "• Deletion — request deletion of your data (subject to legal retention requirements).",
      "• Portability — request your data in a machine-readable format.",
      "• Objection — object to certain processing activities.",
      "To exercise any of these rights, email privacy@trackhive.io. We will respond within 30 days.",
    ],
  },
  {
    title: "9. International Transfers",
    content: [
      "TrackHive is based in the United States. If you access the Service from the European Economic Area (EEA) or other regions with data protection laws, your data will be transferred to and processed in the US.",
      "We rely on Standard Contractual Clauses (SCCs) as the legal mechanism for international transfers from the EEA.",
    ],
  },
  {
    title: "10. Children's Privacy",
    content: [
      "The Service is not directed at individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected such data, we will delete it promptly.",
    ],
  },
  {
    title: "11. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent in-app notice at least 14 days before the changes take effect.",
      "Your continued use of the Service after a change becomes effective constitutes your acceptance of the revised Policy.",
    ],
  },
  {
    title: "12. Contact Us",
    content: [
      "For privacy-related questions or to exercise your rights, contact our Data Protection team at privacy@trackhive.io.",
      "Mailing address: TrackHive Inc., 123 Market Street, Wilmington, DE 19801, USA.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", fontFamily: "inherit" }}>
      {/* Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        display: "flex", alignItems: "center", height: "60px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: "15px", height: "15px", color: "white" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fafafa" }}>TrackHive</span>
        </Link>
        <Link href="/" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#71717a", textDecoration: "none" }}>
          <ArrowLeft style={{ width: "13px", height: "13px" }} /> Back
        </Link>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>Legal</span>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fafafa", margin: "10px 0 12px", lineHeight: 1.2 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "14px", color: "#52525b" }}>Last updated: {LAST_UPDATED}</p>
          <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", gap: "12px" }}>
            <Shield style={{ width: "18px", height: "18px", color: "#34d399", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "13px", color: "#6ee7b7", lineHeight: 1.6 }}>
              We take your privacy seriously. This policy explains exactly what data we collect, why we collect it, and how you can control it.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fafafa", marginBottom: "12px" }}>
                {section.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.content.map((para, i) => (
                  <p key={i} style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.75 }}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ marginTop: "56px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: "13px", color: "#7C3AED", textDecoration: "none" }}>Terms of Service →</Link>
          <Link href="/"      style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Back to home</Link>
          <span style={{ fontSize: "13px", color: "#52525b", marginLeft: "auto" }}>© 2025 TrackHive Inc.</span>
        </div>
      </div>
    </div>
  )
}
