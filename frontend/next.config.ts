import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enable Brotli and Gzip compression at server/client layers
  reactStrictMode: true,
  compiler: {
    // Remove console statements in production to shrink bundle sizes
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
