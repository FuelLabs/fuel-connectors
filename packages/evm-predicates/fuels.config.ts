import { createConfig } from 'fuels';

export default createConfig({
  providerUrl:
    process.env.PROVIDER_URL || 'https://testnet.fuel.network/v1/graphql',
  predicates: ['./predicate'],
  output: './src/generated/tmp',
  forcBuildFlags: ['--release'],
  // needs the private key to deploy the predicate
  privateKey: process.env.PRIVATE_KEY || '0x',
});
