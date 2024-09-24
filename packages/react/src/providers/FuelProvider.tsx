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
   * Whether enforce connectors to be on the desired the network. Requires a FuelChainProvider wrapper.
   * @default true
   */
  monitorNetwork?: boolean;
} & FuelUIProviderProps;

export function FuelProvider({
  theme: _theme,
  children,
  fuelConfig,
  bridgeURL,
  ui = true,
  monitorNetwork = true,
}: FuelProviderProps) {
  const theme = _theme || 'light';
  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig}>
        <FuelUIProvider
          theme={theme}
          bridgeURL={bridgeURL}
          fuelConfig={fuelConfig}
        >
          <Connect />
          {!!monitorNetwork && <NetworkMonitor theme={theme} />}
          {children}
        </FuelUIProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig}>{children}</FuelHooksProvider>
  );
}
