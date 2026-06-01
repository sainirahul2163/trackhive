import Link from "next/link"
import { Zap, ArrowLeft, ShieldCheck, Mail } from "lucide-react"

const LAST_UPDATED = "June 1, 2025"

const RIGHTS = [
  { right: "Right of access",            art: "Art. 15", desc: "You can request a copy of all personal data we hold about you at any time." },
  { right: "Right to rectification",      art: "Art. 16", desc: "You can ask us to correct any inaccurate personal data we hold about you." },
  { right: "Right to erasure",            art: "Art. 17", desc: "You can ask us to delete your personal data (&lsquo;right to be forgotten&rsquo;) in certain circumstances." },
  { right: "Right to restriction",        art: "Art. 18", desc: "You can ask us to restrict how we process your data while we address a complaint." },
  { right: "Right to data portability",   art: "Art. 20", desc: "You can request your data in a machine-readable format and transfer it to another service." },
  { right: "Right to object",             art: "Art. 21", desc: "You can object to processing based on legitimate interests or for direct marketing purposes." },
  { right: "Rights related to automated decision-making", art: "Art. 22", desc: "You have the right not to be subject to solely automated decisions that significantly affect you." },
]

const SECTIONS = [
  {
    title: "Who we are and how to contact us",
    body: "TrackHive is the data controller for personal data collected through our platform. Our registered contact for data protection matters is:\n\nTrackHive Data Protection\nEmail: privacy@trackhive.io\nAddress: Bangalore, Karnataka, India",
  },
  {
    title: "What personal data we collect",
    body: "We collect:\n• Account information: name, email address, company name, job title\n• Usage data: pages visited, features used, device and browser info\n• Creator data you choose to track (public social media profiles)\n• Payment data: billing address, last 4 digits of payment card (full card data processed by Stripe)\n• Communications: emails and support tickets you send us",
  },
  {
    title: "Legal bases for processing",
    body: "We rely on the following legal bases under GDPR Article 6:\n• Contract performance (Art. 6(1)(b)): To provide the TrackHive service you have subscribed to\n• Legitimate interests (Art. 6(1)(f)): To improve our product, prevent fraud, and send service-related communications\n• Consent (Art. 6(1)(a)): For marketing communications and optional analytics cookies\n• Legal obligation (Art. 6(1)(c)): To comply with applicable law (e.g. financial records retention)",
  },
  {
    title: "International data transfers",
    body: "TrackHive uses Supabase (EU region) and Vercel (EU region) as primary infrastructure providers. Where data is transferred outside the EEA, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission, or we verify that the recipient country provides an adequate level of protection.",
  },
  {
    title: "Data retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we retain data for up to 90 days to allow recovery, then permanently delete it unless we are required by law to retain it longer (e.g. 7 years for financial records under Indian tax law).",
  },
  {
    title: "Cookies and tracking",
    body: "We use strictly necessary cookies to keep you signed in. Optional analytics and marketing cookies are only set with your consent. See our Cookie Policy for full details.",
  },
  {
    title: "Data breaches",
    body: "In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, and affected users without undue delay where required under GDPR Art. 33 and 34.",
  },
  {
    title: "Data Protection Impact Assessments",
    body: "We conduct DPIAs for high-risk processing activities as required by GDPR Art. 35, including for new features involving large-scale processing of personal data or new tracking technologies.",
  },
  {
    title: "Right to lodge a complaint",
    body: "If you are located in the EEA and believe we have not handled your data lawfully, you have the right to lodge a complaint with your local data protection authority. A full list of EU supervisory authorities is available on the European Data Protection Board website.",
  },
]

export default function GdprPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", padding: "0 24px", display: "flex", alignItems: "center", height: "60px" }}>
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

      {/* Header */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck style={{ width: "22px", height: "22px", color: "#34d399" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", lineHeight: 1.15 }}>GDPR &amp; Data Subject Rights</h1>
            <p style={{ fontSize: "13px", color: "#52525b", marginTop: "4px" }}>Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        {/* Info box */}
        <div style={{ borderRadius: "12px", border: "1px solid rgba(16,185,129,0.2)", backgroundColor: "rgba(16,185,129,0.06)", padding: "16px 20px", marginBottom: "40px" }}>
          <p style={{ fontSize: "13px", color: "#6ee7b7", lineHeight: 1.6 }}>
            TrackHive is committed to the General Data Protection Regulation (GDPR) and your right to control your personal data. This page explains your data subject rights and how to exercise them.
          </p>
        </div>
      </div>

      {/* Your rights */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 48px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Your rights under GDPR</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {RIGHTS.map(r => (
            <div key={r.right} style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "18px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "5px", backgroundColor: "rgba(124,58,237,0.12)", color: "#a78bfa", flexShrink: 0, fontFamily: "monospace", marginTop: "2px" }}>{r.art}</span>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>{r.right}</p>
                <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: r.desc }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", borderRadius: "12px", border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.06)", padding: "20px 22px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <Mail style={{ width: "18px", height: "18px", color: "#a78bfa", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fafafa", marginBottom: "4px" }}>Exercise your rights</p>
            <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6 }}>
              To exercise any of the rights above, email us at{" "}
              <a href="mailto:privacy@trackhive.io" style={{ color: "#a78bfa", textDecoration: "none" }}>privacy@trackhive.io</a>
              {" "}with the subject line <em>Data Subject Request</em>. We will respond within 30 days as required by GDPR Art. 12.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fafafa", marginBottom: "10px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.body}</p>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Service", h: "/terms" }, { l: "Cookie Policy", h: "/cookies" }, { l: "Home", h: "/" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
