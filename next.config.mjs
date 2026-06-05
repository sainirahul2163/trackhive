/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
    ],
  },
}

export default nextConfig
