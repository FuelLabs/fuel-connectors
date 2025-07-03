import {
  Account,
  type BytesLike,
  type Coin,
  type CursorPaginationArgs,
  type GetCoinsResponse,
  WithAddress,
} from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';
import { useChainId } from './useChainId';
import { useProvider } from './useProvider';

type UseAllCoinsParams<TName extends string = 'coins', TData = Coin[]> = {
  account?: string;

  assetId?: BytesLike;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, TData, Error, TData>;
};

const getAllCoins = async (
  getCoins: (pagination: CursorPaginationArgs) => Promise<GetCoinsResponse>,
) => {
  const allCoins: Coin[] = [];
  const pagination: Partial<CursorPaginationArgs> = {};

  while (true) {
    const { coins, pageInfo } = await getCoins(pagination);
    allCoins.push(...coins);

    if (!pageInfo.hasNextPage) {
      break;
    }

    pagination.after = pageInfo.endCursor;
  }

  return { coins: allCoins };
};

export const useCoins = ({ account, assetId, query }: UseAllCoinsParams) => {
  const { provider } = useProvider();
  const { chainId } = useChainId();

  return useNamedQuery('coins', {
    queryKey: QUERY_KEYS.coins(account, assetId, chainId),
    queryFn: async () => {
      try {
        if (!account) throw new Error('Account is needed');

        const _account = new Account(account, provider);
        const { coins } = await getAllCoins((pagination) =>
          _account.getCoins(assetId, pagination),
        );
        return coins || [];
      } catch (_error: unknown) {
        console.error(_error);
        return [];
      }
    },
    placeholderData: [],
    enabled: !!provider && !!account,
    ...query,
  });
};
