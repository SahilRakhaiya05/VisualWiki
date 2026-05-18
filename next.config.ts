import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "de3.bot-hosting.net", port: "21007" },
      { protocol: "https", hostname: "**" }
    ]
  }
};

export default nextConfig;
