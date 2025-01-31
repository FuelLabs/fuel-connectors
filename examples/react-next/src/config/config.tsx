import { generateETHConnectors } from '@/utils/connectors';
import {
  http,
  cookieStorage,
  createConfig,
  createStorage,
  fallback,
} from 'wagmi';
import { type Chain, sepolia } from 'wagmi/chains';

export const APP = {
  name: 'Fuel Connectors Example APP',
  description: 'SSR Example app of Fuel Connectors',
};

export const CHAINS_TO_CONNECT = [sepolia] as [Chain, ...Chain[]];

export const TRANSPORTS = {
  [CHAINS_TO_CONNECT[0].id]: fallback(
    [
      http(
        `https://eth-${CHAINS_TO_CONNECT[0].name}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_WC_PROJECT_ID}`,
      ),
      http(),
    ],
    { rank: false },
  ),
};

export const DEFAULT_WAGMI_CONFIG = createConfig({
  chains: CHAINS_TO_CONNECT,
  connectors: generateETHConnectors(APP.name),
  transports: TRANSPORTS,
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});
