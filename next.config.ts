import type { NextConfig } from "next";

// برای GitHub Pages نام مخزن را در NEXT_PUBLIC_BASE_PATH می‌گذاریم، مثلاً /fahrplan
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
