import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Adding 100 to the allowed qualities list
    qualities: [25, 50, 75, 80, 90, 100],
  },
};

export default nextConfig;