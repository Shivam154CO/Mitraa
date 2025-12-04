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
  
  api: {
    bodyParser: {
      sizeLimit: '50mb', 
    },
    responseLimit: '50mb',
  },
  
  serverRuntimeConfig: {
    maxBodySize: '50mb',
  },
});

module.exports = nextConfig;