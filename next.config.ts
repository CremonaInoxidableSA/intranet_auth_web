import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "https://192.168.20.150",
    "https://localhost:3000",
    "https://127.0.0.1",
  ],
}

export default nextConfig
