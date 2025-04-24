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
}

export default nextConfig
