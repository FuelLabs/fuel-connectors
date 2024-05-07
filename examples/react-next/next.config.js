/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fuels/connectors'],
  webpack: (config) => {
    config.externals.push(
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
        encoding: 'commonjs encoding',
        module: 'commonjs module',
      },
      // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
      'pino-pretty',
    );

    return config;
  },
};

module.exports = nextConfig;
