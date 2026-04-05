import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  async rewrites() {
    return [{ source: "/@:slug", destination: "/profile/:slug" }];
  },
  //
};

export default nextConfig;
