import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Explicitly set workspace root to silence warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
