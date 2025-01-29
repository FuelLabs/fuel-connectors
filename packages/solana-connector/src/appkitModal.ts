import { type AppKit, createAppKit } from '@reown/appkit';
import {
  type BaseWalletAdapter,
  SolanaAdapter,
} from '@reown/appkit-adapter-solana';
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { DEFAULT_PROJECT_ID } from './constants';

interface CreateAppkitProps {
  solanaAdapter: SolanaAdapter;
  projectId?: string;
}

export function createDefaultSolanaAdapter() {
  return new SolanaAdapter({
    wallets: [new PhantomWalletAdapter()] as unknown as BaseWalletAdapter[],
  });
}

export function createAppkitInstance({
  solanaAdapter,
  projectId = DEFAULT_PROJECT_ID,
}: CreateAppkitProps): AppKit {
  if (!projectId) {
    console.warn(
      '[Solana Connector]: Get a project ID on https://cloud.reown.com/sign-in to use @reown/appkit features.',
    );
  }

  return createAppKit({
    adapters: [solanaAdapter],
    projectId,
    allWallets: 'ONLY_MOBILE',
    networks: [solana, solanaTestnet, solanaDevnet], // @TODO: Should we receive it from the application? as the wagmi adapter config
    features: {
      email: false,
      socials: false,
      analytics: false,
    },
    metadata: {
      name: '@fuels/connectors',
      description: 'Solana Wallets',
      url: 'https://connectors.fuels.network',
      icons: ['https://connectors.fuel.network/logo_white.png'],
    },
  });
}
