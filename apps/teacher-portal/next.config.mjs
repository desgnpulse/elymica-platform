/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@elymica/ui',
      '@elymica/api-client',
      '@elymica/hooks',
    ],
  },

  // Transpile workspace packages
  transpilePackages: [
    '@elymica/tokens',
    '@elymica/ui',
    '@elymica/api-client',
    '@elymica/hooks',
    '@elymica/config',
  ],

  // Production optimizations
  ...( process.env.NODE_ENV === 'production' && {
    // Enable compression
    compress: true,
    // Generate ETags
    generateEtags: true,
    // HTTP strict transport security
    poweredByHeader: false,
  }),
};

export default nextConfig;
