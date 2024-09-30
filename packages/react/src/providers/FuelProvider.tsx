import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import type { NetworkConfig, UIConfig } from '../types';
import { BridgeDialog } from '../ui/Connect/components/Bridge/BridgeDialog';
import { NetworkDialog } from '../ui/Connect/components/Network/NetworkDialog';
import { useNetworkConfigs } from '../ui/Connect/hooks/useNetworkConfigs';
import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  uiConfig?: UIConfig;
  fuelConfig?: FuelConfig;
  networks?: Array<NetworkConfig>;
} & Omit<FuelUIProviderProps, 'uiConfig'>;

export function FuelProvider({
  theme: _theme,
  children,
  fuelConfig,
  uiConfig: _uiConfig,
  ui = true,
  networks: _networks,
}: FuelProviderProps) {
  const theme = _theme || 'light';
  const { networks } = useNetworkConfigs(_networks);
  const uiConfig = Object.assign(
    {
      suggestBridge: true,
    },
    _uiConfig ?? {},
  );

  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig} networks={networks}>
        <FuelUIProvider
          theme={theme}
          fuelConfig={fuelConfig}
          uiConfig={uiConfig}
        >
          <Connect />
          {networks != null && <NetworkDialog theme={theme} />}
          {uiConfig.suggestBridge && <BridgeDialog theme={theme} />}
          {children}
        </FuelUIProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig} networks={networks}>
      {children}
    </FuelHooksProvider>
  );
}
