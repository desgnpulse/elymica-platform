import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@elymica/ui', '@elymica/tokens'],
  experimental: {
    optimizePackageImports: ['@elymica/ui'],
  },
};

export default nextConfig;
