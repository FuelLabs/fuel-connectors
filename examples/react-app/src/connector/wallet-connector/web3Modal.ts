import { http, type Config, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { type Web3Modal, createWeb3Modal } from '@web3modal/wagmi';
import { DEFAULT_PROJECT_ID } from './constants';

// ============================================================
// Web3Modal configuration interfaces
// ============================================================

/**
 * Configuration options for creating Web3Modal instances.
 */
interface CreateWeb3ModalProps {
  /** Wagmi configuration object */
  wagmiConfig: Config | undefined;
  /** WalletConnect project ID */
  projectId?: string;
}

// ============================================================
// Wagmi configuration factory
// ============================================================

/**
 * Creates a default Wagmi configuration with common chains and connectors.
 * This configuration can be customized or extended as needed.
 *
 * @returns Default Wagmi configuration object
 *
 * @example
 * ```typescript
 * const config = createWagmiConfig();
 * const modal = createWeb3ModalInstance({ wagmiConfig: config });
 * ```
 */
export const createWagmiConfig = (): Config =>
  createConfig({
    chains: [sepolia, mainnet],
    syncConnectedChain: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [injected({ shimDisconnect: false })],
  });

// ============================================================
// Web3Modal instance factory
// ============================================================

/**
 * Creates a new Web3Modal instance with the specified configuration.
 * Handles project ID validation and provides sensible defaults.
 *
 * @param options - Configuration options for the modal
 * @param options.wagmiConfig - Wagmi configuration to use
 * @param options.projectId - WalletConnect project ID (optional)
 * @returns Configured Web3Modal instance
 *
 * @example
 * ```typescript
 * const modal = createWeb3ModalInstance({
 *   wagmiConfig: myWagmiConfig,
 *   projectId: 'my-project-id'
 * });
 * ```
 */
export function createWeb3ModalInstance({
  wagmiConfig,
  projectId = DEFAULT_PROJECT_ID,
}: CreateWeb3ModalProps): Web3Modal {
  // Validate project ID
  if (!projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.walletconnect.com to use WalletConnect features.',
    );
  }

  // Create and configure Web3Modal instance
  return createWeb3Modal({
    wagmiConfig: {
      ...wagmiConfig,
      // Enable WalletConnect features if project ID is provided
      // @ts-ignore - enableWalletConnect is a valid option
      enableWalletConnect: !!projectId,
    },
    allWallets: 'ONLY_MOBILE',
    enableAnalytics: false,
    allowUnsupportedChain: true,
    projectId: projectId,
  });
}
