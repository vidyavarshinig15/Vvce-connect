import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Adding 100 to the allowed qualities list
    qualities: [25, 50, 75, 80, 90, 100],
  },
  turbopack: {},
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: /(^|[\\/])(node_modules|\.next)([\\/]|$)/,
        poll: 1000,
      };
    }

    return config;
  },
};

export default nextConfig;