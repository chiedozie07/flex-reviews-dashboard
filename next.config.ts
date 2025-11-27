import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // prevents Next.js from scanning protected macOS folders
  },
  reactStrictMode: true,
  images: {
    // allow the Supabase file host and theflex.global proxy host
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lsmvmmgkpbyqhthzdexc.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "theflex.global",
        port: "",
        pathname: "/**",
      },
    ],
    // optional, keep a small cache TTL for remote images during dev/preview
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
