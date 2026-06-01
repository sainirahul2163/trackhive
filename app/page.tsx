import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  )
}
