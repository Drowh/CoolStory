/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: ["highlight.js"],
  webpack: (config, { isServer }) => {
    // If client-side, don't polyfill Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
