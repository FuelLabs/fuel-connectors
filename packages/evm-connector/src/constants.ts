import type { EIP1193Provider } from './utils/eip-1193';

declare global {
  interface Window {
    ethereum: EIP1193Provider | null;
  }
}
const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW = HAS_WINDOW ? window : null;
export const BETA_5_URL = 'https://beta-5.fuel.network/graphql';
