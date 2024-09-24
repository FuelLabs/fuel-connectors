import {
  assets as AssetsSDK,
  DEFAULT_MIN_PRECISION,
  getAssetFuel,
  getDefaultChainId,
} from 'fuels';
import { useNamedQuery } from '../../../core/useNamedQuery';
import { useFuel } from '../../../providers';
import {
  type IAssetsBalance,
  QUERY_KEYS,
  UnknownAsset,
  isUnknownAsset,
  sortingFn,
} from '../../../utils';

export const useAssetsBalance = () => {
  const { fuel } = useFuel();

  return useNamedQuery('assetsBalance', {
    queryKey: QUERY_KEYS.assetsBalance(),
    queryFn: async () => {
      try {
        const [assets, wallet] = await Promise.all([
          fuel.assets(),
          fuel.getWallet((await fuel.currentAccount()) ?? ''),
        ]);
        const provider = wallet.provider;

        const fullAssets = [...assets, ...AssetsSDK];
        const { balances } = await wallet.getBalances();
        const chainId = provider.getChainId() ?? getDefaultChainId('fuel');

        return balances
          .map<IAssetsBalance>((balance) => {
            const asset = fullAssets
              .map((a) => getAssetFuel(a, chainId))
              .find((a) => a?.assetId === balance.assetId);

            return {
              id: balance.assetId,
              amount: balance.amount,
              decimals: asset?.decimals,
              icon: asset?.icon,
              name: asset?.name,
              symbol: asset?.symbol,
              precision: balance.amount.isZero() ? 1 : DEFAULT_MIN_PRECISION,
              ...(isUnknownAsset(asset) && {
                ...UnknownAsset,
                id: balance.assetId,
                amount: balance.amount.mul(10),
              }),
            } as IAssetsBalance;
          })
          .sort(sortingFn);
      } catch (_error: unknown) {
        return [];
      }
    },
    initialData: [],
  });
};
