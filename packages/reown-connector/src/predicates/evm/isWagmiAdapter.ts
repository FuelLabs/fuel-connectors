import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AdapterBlueprint } from '@reown/appkit/adapters';

export function isWagmiAdapter(
  adapter?: AdapterBlueprint,
): adapter is WagmiAdapter {
  return adapter?.namespace === 'eip155';
}
