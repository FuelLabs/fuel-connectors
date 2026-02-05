import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import { type ReactNode, useMemo } from 'react';
import { PRIVY_APP_ID, PRIVY_CONFIG } from '../constants/privy';
import type { NetworkConfig, PrivyConfig, UIConfig } from '../types';
import { BridgeDialog } from '../ui/Connect/components/Bridge/BridgeDialog';
import { NetworkDialog } from '../ui/Connect/components/Network/NetworkDialog';
import { useNetworkConfigs } from '../ui/Connect/hooks/useNetworkConfigs';
import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';
import { PrivyEventsWatcher } from './PrivyEventsWatcher';
import { PrivyInternalProvider } from './PrivyInternalProvider';

export { useFuel } from './FuelHooksProvider';
export { useConnectUI } from './FuelUIProvider';

type FuelProviderProps = {
  ui?: boolean;
  uiConfig?: UIConfig;
  fuelConfig: FuelConfig;
  networks?: Array<NetworkConfig>;
  socialLogin?: boolean;
} & Pick<FuelUIProviderProps, 'theme' | 'children'>;

const PrivyProviderStack = ({
  socialLoginConfig,
  children,
}: {
  socialLoginConfig: PrivyConfig | null;
  children: ReactNode;
}) => {
  if (!socialLoginConfig) {
    return <>{children}</>;
  }

  return (
    <PrivyInternalProvider
      appId={socialLoginConfig.appId}
      config={socialLoginConfig.config}
    >
      <PrivyEventsWatcher />
      {children}
    </PrivyInternalProvider>
  );
};

export function FuelProvider({
  theme: _theme,
  children,
  fuelConfig,
  uiConfig: _uiConfig,
  ui = true,
  networks: _networks,
  socialLogin: _socialLogin,
}: FuelProviderProps) {
  const theme = _theme || 'light';
  const { networks } = useNetworkConfigs(_networks);
  const uiConfig = useMemo(
    () =>
      Object.assign(
        {
          suggestBridge: true,
        },
        _uiConfig ?? {},
      ),
    [_uiConfig],
  );

  const socialLoginConfig = useMemo(() => {
    if (!_socialLogin) return null;

    return { appId: PRIVY_APP_ID, config: PRIVY_CONFIG };
  }, [_socialLogin]);

  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig} networks={networks}>
        <PrivyProviderStack socialLoginConfig={socialLoginConfig}>
          <FuelUIProvider
            theme={theme}
            fuelConfig={fuelConfig}
            uiConfig={uiConfig}
          >
            <Connect />
            <NetworkDialog theme={theme} />
            {uiConfig.suggestBridge && <BridgeDialog theme={theme} />}
            {children}
          </FuelUIProvider>
        </PrivyProviderStack>
      </FuelHooksProvider>
    );
  }

  return (
    <FuelHooksProvider fuelConfig={fuelConfig} networks={networks}>
      <PrivyProviderStack socialLoginConfig={socialLoginConfig}>
        {children}
      </PrivyProviderStack>
    </FuelHooksProvider>
  );
}
