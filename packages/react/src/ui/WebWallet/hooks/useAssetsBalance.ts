import {
  assets as AssetsSDK,
  bn,
  getAssetFuel,
  getDefaultChainId,
} from 'fuels';
import { useNamedQuery } from '../../../core/useNamedQuery';
import { useFuel } from '../../../providers';
import { QUERY_KEYS } from '../../../utils';
import type { IAssetsBalance } from '../types';

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

        return balances.map<IAssetsBalance>((balance) => {
          const asset = fullAssets
            .map((a) => getAssetFuel(a, chainId))
            .find((a) => a?.assetId === balance.assetId);
          return {
            name: asset?.name ?? 'Unknown',
            symbol: asset?.symbol ?? 'UNK',
            icon: asset?.icon ?? '',
            amount: balance.amount ?? bn(0),
            id: balance.assetId,
            decimals: asset?.decimals ?? 0,
          } as IAssetsBalance;
        });
      } catch (_error: unknown) {
        return [];
      }
    },
    initialData: [],
  });
};
