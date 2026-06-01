/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // @supabase/supabase-js v2.106+ optionally imports @opentelemetry/api
    // which isn't installed. Stub it out so webpack doesn't fail.
    config.resolve.alias["@opentelemetry/api"] = false
    return config
  },
}

export default nextConfig
