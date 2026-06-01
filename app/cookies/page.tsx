import Link from "next/link"
import { Zap, ArrowLeft, Cookie } from "lucide-react"

const LAST_UPDATED = "June 1, 2025"

const COOKIE_TYPES = [
  {
    name: "Strictly necessary cookies",
    required: true,
    desc: "These cookies are essential for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.",
    examples: [
      { name: "sb-access-token", purpose: "Supabase authentication session token", duration: "Session" },
      { name: "sb-refresh-token", purpose: "Supabase refresh token for auto-login", duration: "30 days" },
      { name: "th_session", purpose: "TrackHive workspace session identifier", duration: "Session" },
    ],
  },
  {
    name: "Functional cookies",
    required: false,
    desc: "These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages.",
    examples: [
      { name: "th_prefs",    purpose: "User UI preferences (sidebar collapsed, theme)", duration: "1 year"   },
      { name: "th_onboard",  purpose: "Tracks onboarding completion state",              duration: "90 days"  },
    ],
  },
  {
    name: "Analytics cookies",
    required: false,
    desc: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. All information these cookies collect is aggregated and therefore anonymous.",
    examples: [
      { name: "_ph_*",         purpose: "PostHog product analytics (self-hosted)",      duration: "1 year"  },
      { name: "_ga, _gid",     purpose: "Google Analytics (if enabled by workspace)",   duration: "2 years" },
    ],
  },
  {
    name: "Marketing / targeting cookies",
    required: false,
    desc: "These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites.",
    examples: [
      { name: "_fbp",  purpose: "Meta Pixel — ad attribution", duration: "90 days" },
      { name: "ttclid", purpose: "TikTok ads click ID",         duration: "30 days" },
    ],
  },
]

const SECTIONS = [
  {
    title: "What are cookies?",
    body: "Cookies are small text files that are stored on your browser or device when you visit a website. They are widely used to make websites work or to work more efficiently, as well as to provide reporting information.",
  },
  {
    title: "How we use cookies",
    body: "TrackHive uses cookies to keep you signed in, remember your preferences (such as sidebar state), measure site performance, and — where you have consented — to show you relevant advertising. We do not sell cookie data to third parties.",
  },
  {
    title: "Third-party cookies",
    body: "Some pages may contain content or links to sites provided by third parties (for example, embedded videos or social sharing buttons). These third parties may also set cookies on your device. We do not control these third-party cookies. Please refer to the relevant third party's privacy policy for more information.",
  },
  {
    title: "How to manage or disable cookies",
    body: "You can control and/or delete cookies at any time using your browser settings. Most browsers allow you to refuse cookies and to delete cookies. Note that if you block strictly necessary cookies, some parts of TrackHive will not function correctly. You can also opt out of analytics by visiting our Privacy Settings page inside the dashboard.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. When we make material changes, we will update the 'Last updated' date at the top of this page. We encourage you to review this policy periodically.",
  },
  {
    title: "Contact",
    body: "If you have questions about our use of cookies, please email us at privacy@trackhive.io.",
  },
]

export default function CookiesPage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cookie style={{ width: "22px", height: "22px", color: "#a78bfa" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fafafa", lineHeight: 1.15 }}>Cookie Policy</h1>
            <p style={{ fontSize: "13px", color: "#52525b", marginTop: "4px" }}>Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "48px" }}>
          This Cookie Policy explains how TrackHive (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) uses cookies and similar tracking technologies when you use our platform. Please read this policy carefully to understand what cookies we use and why.
        </p>
      </div>

      {/* Cookie types */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 48px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", marginBottom: "20px" }}>Cookies we use</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {COOKIE_TYPES.map(ct => (
            <div key={ct.name} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", padding: "24px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fafafa", flex: 1 }}>{ct.name}</p>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", backgroundColor: ct.required ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: ct.required ? "#34d399" : "#71717a" }}>
                  {ct.required ? "Required" : "Optional"}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#71717a", lineHeight: 1.6, marginBottom: "16px" }}>{ct.desc}</p>
              <div style={{ borderRadius: "9px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 100px", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Purpose</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration</span>
                </div>
                {ct.examples.map((ex, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 100px", padding: "9px 12px", borderBottom: i < ct.examples.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <code style={{ fontSize: "11px", color: "#a78bfa", fontFamily: "monospace" }}>{ex.name}</code>
                    <span style={{ fontSize: "12px", color: "#a1a1aa" }}>{ex.purpose}</span>
                    <span style={{ fontSize: "12px", color: "#52525b" }}>{ex.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prose sections */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fafafa", marginBottom: "10px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Service", h: "/terms" }, { l: "GDPR", h: "/gdpr" }, { l: "Home", h: "/" }].map(({ l, h }) => (
          <Link key={l} href={h} style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>{l}</Link>
        ))}
      </footer>
    </div>
  )
}
