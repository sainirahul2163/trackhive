import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://trackhive.io"),
  title: {
    default:  "TrackHive",
    template: "%s | TrackHive",
  },
  description:
    "Track every creator. Manage campaigns. Pay results. The UGC analytics platform built for brands and agencies.",
  keywords: [
    "UGC analytics",
    "creator tracking",
    "campaign management",
    "influencer payments",
    "TikTok analytics",
    "influencer marketing platform",
  ],
  authors:  [{ name: "TrackHive", url: "https://trackhive.io" }],
  creator:  "TrackHive",
  openGraph: {
    type:      "website",
    locale:    "en_US",
    url:       "https://trackhive.io",
    siteName:  "TrackHive",
    title:     "TrackHive — UGC Analytics & Campaign Management",
    description:
      "Track every creator. Manage campaigns. Pay results. The UGC analytics platform built for brands and agencies.",
    images: [
      {
        url:    "/og?title=TrackHive&description=UGC+Analytics+Platform",
        width:  1200,
        height: 630,
        alt:    "TrackHive",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@trackhive",
    creator:     "@trackhive",
    title:       "TrackHive — UGC Analytics & Campaign Management",
    description: "Track every creator. Manage campaigns. Pay results.",
    images:      ["/og?title=TrackHive&description=UGC+Analytics+Platform"],
  },
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-video-preview":  -1,
      "max-image-preview":  "large",
      "max-snippet":        -1,
    },
  },
  icons: {
    icon:     "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: "https://trackhive.io",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  )
}
