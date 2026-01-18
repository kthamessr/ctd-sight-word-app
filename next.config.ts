import type { NextConfig } from "next";

// Allow basePath to be controlled via env for flexible deployments:
// - For GitHub Pages set NEXT_PUBLIC_BASE_PATH="/ctd-sight-word-app"
// - For Vercel/Netlify/custom hosting leave it empty
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // Static HTML export for static hosting
  basePath: BASE_PATH,
  images: { unoptimized: true },
  reactCompiler: false,
  typescript: { ignoreBuildErrors: false },
  // Silence multi-lockfile root warning during local builds
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
