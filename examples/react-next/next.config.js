/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fuels/connectors', '@fuels/react'],
  webpack: (config) => {
    // https://docs.reown.com/appkit/next/core/installation#extra-configuration
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    return config;
  },
};

module.exports = nextConfig;
