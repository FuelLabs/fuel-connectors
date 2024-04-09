import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, type Config, createConfig, injected } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { type Web3Modal, createWeb3Modal } from '@web3modal/wagmi';

export default class WagmiConfig {
  private WAGMI_PROJECT_ID = '0e0f5503e675e719c07e73ff5f38d31f';
  private WAGMI_PROJECT_URL = 'http://localhost:5173';

  private metadata = {
    name: 'WalletConnect Connector',
    description: 'WalletConnect Connector',
    url: this.WAGMI_PROJECT_URL,
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  };

  private ethConfig: Config;
  private ethModal: Web3Modal;

  constructor() {
    this.ethConfig = createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
      connectors: [
        walletConnect({
          projectId: this.WAGMI_PROJECT_ID,
          metadata: this.metadata,
          showQrModal: false,
        }),
        injected({ shimDisconnect: false }),
        coinbaseWallet({
          appName: this.metadata.name,
          appLogoUrl: this.metadata.icons[0],
          darkMode: true,
          reloadOnDisconnect: true,
        }),
      ],
    });

    this.ethModal = createWeb3Modal({
      wagmiConfig: this.ethConfig,
      projectId: this.WAGMI_PROJECT_ID,
    });
  }

  getEthConfig() {
    return this.ethConfig;
  }

  getEthModal() {
    return this.ethModal;
  }
}
