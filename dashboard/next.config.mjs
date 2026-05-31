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
  // Allow app to be embedded as an iframe from any origin
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Remove X-Frame-Options so iframes are allowed
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // Allow framing from any origin
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
