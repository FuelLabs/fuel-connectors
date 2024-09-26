import type { FuelConfig } from 'fuels';

import type { NetworkConfig, UIConfig } from '../types';
import { Connect } from '../ui/Connect';
import { BridgeDialog } from '../ui/Connect/components/Bridge/BridgeDialog';
import { NetworkDialog } from '../ui/Connect/components/Network/NetworkDialog';
import { useNetworkConfigs } from '../ui/Connect/hooks/useNetworkConfigs';
import { WebWallet } from '../ui/WebWallet';
import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  hideWebWallet?: boolean;
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
  hideWebWallet,
  networks,
}: FuelProviderProps) {
  const theme = _theme || 'light';
  const networksConfig = useNetworkConfigs(networks);
  const uiConfig = Object.assign(
    {
      suggestBridge: true,
    },
    _uiConfig ?? {},
  );

  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig} networks={networksConfig}>
        <FuelUIProvider
          theme={theme}
          fuelConfig={fuelConfig}
          uiConfig={uiConfig}
        >
          <Connect />
          {!hideWebWallet && <WebWallet />}
          {networks != null && <NetworkDialog theme={theme} />}
          {uiConfig.suggestBridge && <BridgeDialog theme={theme} />}
          {children}
        </FuelUIProvider>
      </FuelHooksProvider>
    );
  }
  return (
    <FuelHooksProvider fuelConfig={fuelConfig} networks={networksConfig}>
      {children}
    </FuelHooksProvider>
  );
}
