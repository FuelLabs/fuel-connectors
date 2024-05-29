/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fuels/connectors'],
  webpack: (config) => {
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    // https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    return config;
  },
};

module.exports = nextConfig;
