"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Zap, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/demo" },
  { label: "Blog", href: "#" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: scrolled ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0.6)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          transition: "background-color 0.25s, border-color 0.25s",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
              <Zap style={{ width: "16px", height: "16px", color: "#fff", fill: "#fff" }} />
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>TrackHive</span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden md:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: 500, color: "#a1a1aa", textDecoration: "none", transition: "color 0.15s" }}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hidden md:flex">
            <Link
              href="/login"
              style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#a1a1aa", textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.15s" }}
              className="hover:text-white hover:border-white/20"
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, color: "#fff", textDecoration: "none", backgroundColor: "#7C3AED", boxShadow: "0 0 20px rgba(124,58,237,0.3)", transition: "all 0.15s" }}
              className="hover:bg-purple-700"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X style={{ width: "18px", height: "18px", color: "#fafafa" }} /> : <Menu style={{ width: "18px", height: "18px", color: "#fafafa" }} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 49,
              backgroundColor: "#111111",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "16px 24px 24px",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: "10px 12px", borderRadius: "8px", fontSize: "15px", fontWeight: 500, color: "#a1a1aa", textDecoration: "none", transition: "color 0.15s" }}
                  className="hover:text-white hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#a1a1aa", textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, color: "#fff", textDecoration: "none", backgroundColor: "#7C3AED", textAlign: "center" }}
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
