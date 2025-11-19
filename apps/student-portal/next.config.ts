import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@elymica/ui', '@elymica/tokens', '@elymica/api-client', '@elymica/hooks'],

  // Cloudflare compatibility
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization
  },

  // Disable static optimization for dynamic routes
  output: 'standalone',

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  experimental: {
    optimizePackageImports: ['@elymica/ui', '@elymica/api-client', '@elymica/hooks'],
  },

  // Production settings
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
