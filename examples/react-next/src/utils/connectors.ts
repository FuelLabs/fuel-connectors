import type { CreateConnectorFn } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

export function generateETHConnectors(
  appName: string,
): Array<CreateConnectorFn> {
  const connectors: Array<CreateConnectorFn> = [
    injected({
      shimDisconnect: true,
      target: () => ({
        id: 'io.metamask',
        name: 'MetaMask',
        provider: 'isMetaMask',
        icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/SVG_MetaMask_Icon_Color.svg',
      }),
    }),
    coinbaseWallet({ appName, headlessMode: true }),
  ];

  if (process.env.NEXT_PUBLIC_WC_PROJECT_ID) {
    connectors.push(
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
        showQrModal: false,
      }),
    );
  }
  return connectors;
}
