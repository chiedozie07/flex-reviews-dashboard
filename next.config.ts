import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // supabase storage
      {
        protocol: "https",
        hostname: "lsmvmmgkpbyqhthzdexc.supabase.co",
        port: "",
        pathname: "/**",
      },

      // flex global image proxy
      {
        protocol: "https",
        hostname: "theflex.global",
        port: "",
        pathname: "/**",
      },

      // iStock / getty images
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        port: "",
        pathname: "/**",
      },

      // optional: allow common stock image hosts
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      }
    ],

    minimumCacheTTL: 60,
  },
};

export default nextConfig;