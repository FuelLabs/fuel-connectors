import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import { FuelChainProvider } from '../providers/FuelChainProvider';
import { NetworkMonitor } from '../ui/NetworkMonitor';
import { FuelHooksProvider, useFuel } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  fuelConfig?: FuelConfig;
  /**
   * Whether enforce connectors to be on the desired the network.
   * @default true
   */
  chainId?: number;
} & FuelUIProviderProps;

export function FuelProvider({
  theme: _theme,
  children,
  fuelConfig,
  bridgeURL,
  ui = true,
  chainId,
}: FuelProviderProps) {
  const theme = _theme || 'light';
  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig}>
        <FuelChainProvider value={chainId ?? undefined}>
          <FuelUIProvider
            theme={theme}
            bridgeURL={bridgeURL}
            fuelConfig={fuelConfig}
          >
            <Connect />
            {chainId != null && <NetworkMonitor theme={theme} />}
            {children}
          </FuelUIProvider>
        </FuelChainProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig}>{children}</FuelHooksProvider>
  );
}
