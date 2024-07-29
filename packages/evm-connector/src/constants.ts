declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: typedef set by a dependency, must be any to match previous declaration
    ethereum?: any;
  }
}
const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW = HAS_WINDOW ? window : null;
export const TESTNET_URL = 'https://testnet.fuel.network/v1/graphql';
