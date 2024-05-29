import { createConfig } from 'fuels';

export default createConfig({
  contracts: ['./contracts/'],
  output: './src/types/',
  useBuiltinForc: true,
  useBuiltinFuelCore: true,
});
