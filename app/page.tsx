import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { SocialProof } from "@/components/marketing/social-proof"
import { Features } from "@/components/marketing/features"

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
      </main>
    </div>
  )
}
