import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, // Disabled to allow build with setState-in-effect patterns
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
