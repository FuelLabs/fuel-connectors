import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import { WebWallet } from '../ui/WebWallet';
import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  showWebWallet?: boolean;
  fuelConfig?: FuelConfig;
} & FuelUIProviderProps;

export function FuelProvider({
  theme,
  children,
  fuelConfig,
  bridgeURL,
  ui = true,
  showWebWallet = false,
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
          {showWebWallet && <WebWallet />}
          {children}
        </FuelUIProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig}>{children}</FuelHooksProvider>
  );
}
