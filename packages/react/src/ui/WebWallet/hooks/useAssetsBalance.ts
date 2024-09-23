import {
  assets as AssetsSDK,
  bn,
  getAssetFuel,
  getDefaultChainId,
} from 'fuels';
import { useNamedQuery } from '../../../core/useNamedQuery';
import { useFuel } from '../../../providers';
import { QUERY_KEYS } from '../../../utils';
import { type IAssetsBalance, UnknownAsset, isUnknownAsset } from '../types';

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
            return isUnknownAsset(asset)
              ? {
                  name: asset?.name ?? UnknownAsset.name,
                  symbol: asset?.symbol ?? UnknownAsset.symbol,
                  icon: asset?.icon ?? UnknownAsset.icon,
                  amount: balance.amount.mul(10),
                  id: balance.assetId,
                  decimals: asset?.decimals ?? UnknownAsset.decimals,
                }
              : ({
                  name: asset?.name ?? UnknownAsset.name,
                  symbol: asset?.symbol ?? UnknownAsset.symbol,
                  icon: asset?.icon ?? UnknownAsset.icon,
                  amount: balance.amount ?? UnknownAsset.amount,
                  id: balance.assetId,
                  decimals: asset?.decimals ?? UnknownAsset.decimals,
                } as IAssetsBalance);
          })
          .sort((a, b) => {
            // if asset.symbol is "ETH" then it will be should be first
            if (a.symbol === 'ETH') return -1;

            const aName = a.name.toLowerCase() ?? '';
            const bName = b.name.toLowerCase() ?? '';
            // sort ascendant by asset.name
            if (aName > bName) return -1;
            if (bName > aName) return 1;

            return 0;
          });
      } catch (_error: unknown) {
        return [];
      }
    },
    initialData: [],
  });
};
