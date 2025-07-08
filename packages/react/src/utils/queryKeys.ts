import type { QueryKey } from '@tanstack/react-query';
import type { BytesLike, Network, Provider } from 'fuels';
import type { NetworkConfig } from '../types';

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
  coins: (
    address?: string,
    assetId?: BytesLike,
    chainId?: number | undefined | null,
  ): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('coins');
    if (address) queryKey.push(address);
    if (assetId) queryKey.push(assetId);
    if (typeof chainId === 'number') queryKey.push(chainId);
    return queryKey;
  },
  consolidation: (): QueryKey => {
    return QUERY_KEYS.base.concat('consolidation');
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
  chainId: (): QueryKey => {
    return QUERY_KEYS.base.concat('chain-id');
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
    chainId?: number | undefined,
  ): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('balance');
    if (address) queryKey.push(address);
    if (assetId) queryKey.push(assetId);
    if (chainId !== undefined) queryKey.push(chainId);
    return queryKey;
  },
  wallet: (address?: string | null, providerUrl?: string | null): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('wallet');
    if (address) queryKey.push(address);
    if (providerUrl) queryKey.push(providerUrl);
    return queryKey;
  },
  transaction: (id?: string): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('transaction');
    if (id) queryKey.push(id);
    return queryKey;
  },
  transactionReceipts: (id?: string, chainId?: number | null): QueryKey => {
    const queryKey = QUERY_KEYS.transaction(id).concat('receipts');
    if (chainId !== undefined) queryKey.push(chainId);
    return queryKey;
  },
  transactionResult: (id?: string, chainId?: number | null): QueryKey => {
    const queryKey = QUERY_KEYS.transaction(id).concat('result');
    if (chainId !== undefined) queryKey.push(chainId);
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
  isSupportedNetwork: (
    connectorName: string | null | undefined,
    networks: Array<NetworkConfig>,
    network: Partial<Network> | null,
    isConnected: boolean,
  ): QueryKey => {
    const queryKey = QUERY_KEYS.base.concat('isSupportedNetwork');
    if (connectorName) queryKey.push(connectorName);
    if (networks) queryKey.push(networks);
    if (network) queryKey.push(network);
    if (isConnected) queryKey.push(isConnected);
    return queryKey;
  },
};

export const MUTATION_KEYS = {
  connect: 'connect',
  addAssets: 'addAssets',
  addNetwork: 'addNetwork',
};
