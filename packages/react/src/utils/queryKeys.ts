import type { QueryKey } from '@tanstack/react-query';
import type { BytesLike, Provider } from 'fuels';

export const QUERY_KEYS = {
  base: ['fuel'] as QueryKey,
  account: (): QueryKey => {
    return QUERY_KEYS.base.concat('account');
  },
  accounts: (): QueryKey => {
    return QUERY_KEYS.base.concat('accounts');
  },
  assets: (): QueryKey => {
    return QUERY_KEYS.base.concat('assets');
  },
  contract: (
    address: string,
    chainId: number | undefined,
    args: string | undefined,
  ): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('contract').concat(address);
    if (typeof args !== 'undefined') queryKey.push(args);
    if (typeof chainId !== 'undefined') queryKey.push(chainId);
    return queryKey;
  },
  chain: (): QueryKey => {
    return QUERY_KEYS.base.concat('chain');
  },
  isConnected: (): QueryKey => {
    return QUERY_KEYS.base.concat('isConnected');
  },
  networks: (): QueryKey => {
    return QUERY_KEYS.base.concat('networks');
  },
  provider: (): QueryKey => {
    return QUERY_KEYS.base.concat('provider');
  },
  balance: (
    address?: string,
    assetId?: BytesLike,
    provider?: Provider | null,
  ): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('balance');
    if (address) queryKey.push(address);
    if (assetId) queryKey.push(assetId);
    if (provider) queryKey.push(provider.getChainId());
    return queryKey;
  },
  wallet: (address?: string | null): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('wallet');
    if (address) queryKey.push(address);
    return queryKey;
  },
  transaction: (id?: string): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('transaction');
    if (id) queryKey.push(id);
    return queryKey;
  },
  transactionReceipts: (id?: string): QueryKey => {
    const queryKey = QUERY_KEYS.transaction(id).concat('receipts');
    return queryKey;
  },
  transactionResult: (id?: string): QueryKey => {
    const queryKey = QUERY_KEYS.transaction(id).concat('result');
    return queryKey;
  },
  nodeInfo: (url?: string): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('nodeInfo');
    if (url) queryKey.push(url);
    return queryKey;
  },
  connectorList: (): QueryKey => {
    return QUERY_KEYS.base.concat('connectorList');
  },
  currentConnector: (): QueryKey => {
    return QUERY_KEYS.base.concat(['currentConnector']);
  },
  currentNetwork: (): QueryKey => {
    return QUERY_KEYS.base.concat('currentNetwork');
  },
};

export const MUTATION_KEYS = {
  connect: 'connect',
  addAssets: 'addAssets',
  addNetwork: 'addNetwork',
};
