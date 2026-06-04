import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:  "Campaign Detail",
    robots: { index: false, follow: false },
  }
}

export default function CampaignDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
