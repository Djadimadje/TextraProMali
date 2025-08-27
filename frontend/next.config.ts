import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  // Ensure static assets are served correctly
  async rewrites() {
    return [
      {
        source: '/image/:path*',
        destination: '/image/:path*',
      },
    ]
  },
};

export default nextConfig;
