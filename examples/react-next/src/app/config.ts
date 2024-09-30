import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { injected } from '@wagmi/core';
import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '00000000000000000000000000000000';
const METADATA = {
  name: 'Wallet Demo',
  description: 'Fuel Wallets Demo',
  url: '/',
  icons: ['https://connectors.fuel.network/logo_white.png'],
};
export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [
      injected({ shimDisconnect: false }),
      walletConnect({
        projectId: WC_PROJECT_ID,
        metadata: METADATA,
        showQrModal: false,
      }),
      coinbaseWallet({
        appName: METADATA.name,
        appLogoUrl: METADATA.icons[0],
        darkMode: true,
        reloadOnDisconnect: true,
      }),
    ],
  });
}
