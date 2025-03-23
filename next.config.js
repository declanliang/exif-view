/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['exifr'],
  },
};

module.exports = nextConfig; 