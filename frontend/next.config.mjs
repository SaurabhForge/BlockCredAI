import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly anchor Turbopack to the frontend package directory.
  // Required on Windows paths with spaces (e.g., OneDrive) where
  // Turbopack's automatic workspace-root inference can drift.
  turbopack: {
    root: resolve(__dirname)
  }
};

export default nextConfig;
