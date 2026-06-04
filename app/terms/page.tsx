import type { Metadata } from "next"
import Link from "next/link"
import { Zap, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the TrackHive Terms of Service. Last updated 2025.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://trackhive.io/terms" },
}

const LAST_UPDATED = "June 1, 2025"

interface Section {
  title: string
  content: string[]
}

const SECTIONS: Section[] = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using TrackHive (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the Service.",
      "We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will notify you of material changes via email or in-app notice.",
    ],
  },
  {
    title: "2. Description of Service",
    content: [
      "TrackHive is a UGC (User-Generated Content) analytics and creator management platform that allows brands and agencies to track creator performance, manage influencer campaigns, process creator payments, and monitor competitor activity.",
      "The Service is intended for business use. You represent that you are using it on behalf of an organisation or as a freelance professional, not as an individual consumer.",
    ],
  },
  {
    title: "3. Account Registration",
    content: [
      "You must create an account to access most features of the Service. You agree to provide accurate, complete, and current information during registration.",
      "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at support@trackhive.io of any unauthorised use of your account.",
      "Each account may only be used by one individual unless you have purchased a multi-seat plan. Sharing credentials across multiple people is not permitted on single-seat plans.",
    ],
  },
  {
    title: "4. Subscription & Billing",
    content: [
      "TrackHive offers paid subscription plans. By subscribing, you authorise us to charge your payment method on a recurring basis (monthly or annually) until you cancel.",
      "All prices are in USD and exclusive of applicable taxes. We reserve the right to change pricing with 30 days notice.",
      "Refunds are provided at our discretion. If you believe you were charged in error, contact support@trackhive.io within 14 days of the charge.",
      "You may cancel your subscription at any time. Your access continues until the end of the current billing period; no partial refunds are issued for unused time.",
    ],
  },
  {
    title: "5. Acceptable Use",
    content: [
      "You agree not to use the Service to: (a) scrape or harvest data in violation of a platform's terms of service; (b) process personal data of creators without appropriate legal basis; (c) infringe any intellectual property rights; (d) transmit spam, malware, or harmful code; (e) circumvent any security feature of the Service.",
      "We reserve the right to suspend or terminate accounts that violate these rules without notice or refund.",
    ],
  },
  {
    title: "6. Creator Data & Privacy",
    content: [
      "When you add a creator's public profile to TrackHive, you are accessing publicly available information. You are responsible for ensuring your use of this data complies with applicable laws including GDPR, CCPA, and any relevant platform terms.",
      "You must not use creator data obtained through TrackHive to harass, discriminate against, or engage in unlawful profiling of individuals.",
    ],
  },
  {
    title: "7. Intellectual Property",
    content: [
      "TrackHive and its content, features, and functionality are owned by TrackHive Inc. and are protected by copyright, trademark, and other intellectual property laws.",
      "You retain ownership of any content you upload to the Service (e.g. campaign briefs, logos). By uploading content, you grant TrackHive a limited licence to use it solely to provide the Service to you.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    content: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRACKHIVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.",
      "Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid to us in the 12 months preceding the claim.",
    ],
  },
  {
    title: "9. Disclaimers",
    content: [
      "THE SERVICE IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT ANY DATA METRICS ARE PERFECTLY ACCURATE.",
      "Creator performance data is based on publicly available information and may not reflect real-time or precise figures. Do not make critical business decisions based solely on TrackHive data without independent verification.",
    ],
  },
  {
    title: "10. Governing Law",
    content: [
      "These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.",
      "Any disputes arising under these Terms shall be resolved through binding arbitration under the rules of the American Arbitration Association, except that either party may seek injunctive relief in a court of competent jurisdiction.",
    ],
  },
  {
    title: "11. Contact",
    content: [
      "If you have questions about these Terms, please contact us at legal@trackhive.io or by mail at: TrackHive Inc., 123 Market Street, Wilmington, DE 19801, USA.",
    ],
  },
]

export default function TermsPage() {
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
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em" }}>Legal</span>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#fafafa", margin: "10px 0 12px", lineHeight: 1.2 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: "14px", color: "#52525b" }}>Last updated: {LAST_UPDATED}</p>
          <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "10px", backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <p style={{ fontSize: "13px", color: "#a78bfa", lineHeight: 1.6 }}>
              Please read these Terms carefully before using TrackHive. By using our Service you agree to be legally bound by them.
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
          <Link href="/privacy" style={{ fontSize: "13px", color: "#7C3AED", textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/"        style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>Back to home</Link>
          <span style={{ fontSize: "13px", color: "#52525b", marginLeft: "auto" }}>© 2025 TrackHive Inc.</span>
        </div>
      </div>
    </div>
  )
}
