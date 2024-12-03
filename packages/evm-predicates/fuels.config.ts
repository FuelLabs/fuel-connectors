import dotenv from 'dotenv';
import { createConfig } from 'fuels';

dotenv.config({
  path: ['.env.local', '.env'],
});

export default createConfig({
  providerUrl: 'http://localhost:4000/v1/graphql',
  predicates: ['./predicate'],
  output: './src/generated/tmp',
  forcBuildFlags: ['--release'],
  // needs the private key to deploy the predicate
  privateKey:
    '0xa449b1ffee0e2205fa924c6740cc48b3b473aa28587df6dab12abc245d1f5298',
});
