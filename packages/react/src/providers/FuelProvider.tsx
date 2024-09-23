import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  fuelConfig?: FuelConfig;
} & FuelUIProviderProps;

export function FuelProvider({
  theme,
  children,
  fuelConfig,
  bridgeURL,
  ui = true,
}: FuelProviderProps) {
  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig}>
        <FuelUIProvider
          theme={theme}
          bridgeURL={bridgeURL}
          fuelConfig={fuelConfig}
        >
          <Connect />
          {children}
        </FuelUIProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig}>{children}</FuelHooksProvider>
  );
}
