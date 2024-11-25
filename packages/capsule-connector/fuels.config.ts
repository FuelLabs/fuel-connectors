import { createConfig } from 'fuels';

export default createConfig({
  providerUrl: 'https://testnet.fuel.network/v1/graphql',
  predicates: ['./predicate'],
  output: './src/generated/tmp',
  forcBuildFlags: ['--release'],
  // needs the private key to deploy the predicate
  privateKey: '0x',
});
