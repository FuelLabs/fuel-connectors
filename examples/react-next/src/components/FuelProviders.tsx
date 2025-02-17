'use client';

import { createConfig, defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import type { AppKit } from '@reown/appkit';
import { CHAIN_IDS, Provider } from 'fuels';
import { useMemo, useState } from 'react';

interface FuelProvidersProps {
  children: React.ReactNode;
  appkit: AppKit;
}

const NETWORKS = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: 'https://testnet.fuel.network/v1/graphql',
  },
];

export const FuelProviders = ({ children, appkit }: FuelProvidersProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // For SSR application we need to use
  // createConfig to avoid errors related to window
  // usage inside the connectors.
  const fuelConfig = useMemo(() => {
    return createConfig(() => {
      return {
        connectors: defaultConnectors({
          devMode: true,
          appkit,
          chainId: NETWORKS[0].chainId,
          fuelProvider: new Provider(NETWORKS[0].url),
        }),
      };
    });
  }, [appkit]);

  return (
    <>
      <button
        type="submit"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        Switch theme {theme}
      </button>
      <FuelProvider theme={theme} fuelConfig={fuelConfig} networks={NETWORKS}>
        {children}
      </FuelProvider>
    </>
  );
};
