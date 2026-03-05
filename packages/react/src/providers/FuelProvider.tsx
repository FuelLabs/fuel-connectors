import type { FuelConfig } from 'fuels';

import { Connect } from '../ui/Connect';

import { type ReactNode, Suspense, lazy, useMemo } from 'react';
import type { NetworkConfig, UIConfig } from '../types';
import { BridgeDialog } from '../ui/Connect/components/Bridge/BridgeDialog';
import { NetworkDialog } from '../ui/Connect/components/Network/NetworkDialog';
import { useNetworkConfigs } from '../ui/Connect/hooks/useNetworkConfigs';
import { FuelHooksProvider } from './FuelHooksProvider';
import { FuelUIProvider, type FuelUIProviderProps } from './FuelUIProvider';

/**
 * Lazy load Privy components only when social login is enabled.
 * This preserves backward compatibility for users who don't install @privy-io/react-auth.
 */
const LazyPrivyStack = lazy(() =>
  import('./PrivyStack').then((m) => ({
    default: m.PrivyStack,
  })),
);

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
  socialLogin,
  children,
}: {
  socialLogin?: boolean;
  children: ReactNode;
}) => {
  if (!socialLogin) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={children}>
      <LazyPrivyStack>{children}</LazyPrivyStack>
    </Suspense>
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

  if (ui) {
    return (
      <FuelHooksProvider fuelConfig={fuelConfig} networks={networks}>
        <PrivyProviderStack socialLogin={_socialLogin}>
          <FuelUIProvider
            theme={theme}
            fuelConfig={fuelConfig}
            uiConfig={uiConfig}
            socialLogin={_socialLogin}
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
      <PrivyProviderStack socialLogin={_socialLogin}>
        {children}
      </PrivyProviderStack>
    </FuelHooksProvider>
  );
}
