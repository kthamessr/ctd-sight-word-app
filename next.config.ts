import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Enable static HTML export for GitHub Pages
  basePath: '/ctd-sight-word-app', // Replace with your repo name
  images: {
    unoptimized: true, // Required for static export
  },
  reactCompiler: false, // Disabled to allow build with setState-in-effect patterns
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
