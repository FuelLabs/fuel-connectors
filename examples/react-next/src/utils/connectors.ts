import type { CreateConnectorFn } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';

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

  return connectors;
}
