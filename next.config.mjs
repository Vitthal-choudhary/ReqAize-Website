/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Ensure node modules aren't included in client bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle node modules for client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        util: false,
      };
    }
    
    return config;
  },
  // Environment variables that will be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

export default nextConfig
