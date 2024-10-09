import type { FuelConfig } from 'fuels';

export function createConfig(func: () => FuelConfig) {
  if (typeof window === 'undefined')
    return {
      connectors: [],
    };
  return func();
}
