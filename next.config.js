/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
  
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  
  serverRuntimeConfig: {
    bodySizeLimit: '50mb',
  },
  
  staticPageGenerationTimeout: 120,
});

module.exports = nextConfig;