import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@react-pdf/renderer'],
  },
  webpack: (config) => {
    // @react-pdf/renderer ships some node-targeted code; mark as client-only.
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
