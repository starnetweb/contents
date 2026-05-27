/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Allow production builds to complete even if there are type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during Docker build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
