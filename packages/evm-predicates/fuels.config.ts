import { createConfig } from 'fuels';

export default createConfig({
  providerUrl: 'http://localhost:4000/v1/graphql',
  predicates: ['./predicate'],
  output: './src/generated/tmp',
  forcBuildFlags: ['--release'],
  // needs the private key to deploy the predicate
  privateKey:
    '0x94ffcc53b892684acefaebc8a3d4a595e528a8cf664eeb3ef36f1020b0809d0d', // genesis private key
});
