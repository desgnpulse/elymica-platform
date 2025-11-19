import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@elymica/ui', '@elymica/tokens', '@elymica/api-client', '@elymica/hooks'],
  experimental: {
    optimizePackageImports: ['@elymica/ui'],
  },
};

export default nextConfig;
