import { createConfig } from 'fuels';

export default createConfig({
  predicates: ['./predicate'],
  output: './src',
  forcBuildFlags: ['--release'],
});
