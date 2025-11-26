import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // Prevents Next.js from scanning protected macOS folders
  },
};

export default nextConfig;
