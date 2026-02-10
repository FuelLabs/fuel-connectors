import type { PrivyClientConfig } from '@privy-io/react-auth';

export const PRIVY_APP_ID = 'cmdddunbk00njjf0nz6r5r3e9';

export const PRIVY_CONFIG: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
  },
  loginMethods: ['email'],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
};
