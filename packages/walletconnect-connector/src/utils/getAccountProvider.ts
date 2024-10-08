import type { EIP1193Provider, Maybe } from '@fuel-connectors/common';
import { type Config, getAccount } from '@wagmi/core';
import { forceRetryWithTimeout } from './forceRetryWithTimeout';

export function getAccountProvider(
  wagmiConfig: Maybe<Config>,
): Promise<EIP1193Provider | undefined> {
  if (!wagmiConfig) {
    return Promise.resolve(undefined);
  }
  return forceRetryWithTimeout<EIP1193Provider>({
    fn: () =>
      getAccount(
        wagmiConfig,
      ).connector?.getProvider?.() as Promise<EIP1193Provider>,
    compareFn: (provider) => !!provider,
  });
}
