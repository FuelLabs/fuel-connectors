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

function FuelUI({ theme, children, fuelConfig }: FuelProviderProps) {
  return (
    <FuelUIProvider theme={theme} fuelConfig={fuelConfig}>
      <Connect />
      {children}
    </FuelUIProvider>
  );
}

export function FuelProvider({
  theme,
  children,
  fuelConfig,
  ui = true,
}: FuelProviderProps) {
  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig}>
        <FuelUI fuelConfig={fuelConfig} theme={theme}>
          {children}
        </FuelUI>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig}>{children}</FuelHooksProvider>
  );
}
