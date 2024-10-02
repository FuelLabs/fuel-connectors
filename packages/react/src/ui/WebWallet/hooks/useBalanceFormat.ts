import { DEFAULT_DECIMAL_UNITS, DEFAULT_MIN_PRECISION, format } from 'fuels';
import { useMemo } from 'react';
import { type IAssetsBalance, isUnknownAsset } from '../../../utils';

export interface BalanceFormat {
  formattedBalance: string;
  formattedBalanceFull: string;
}
export const useBalanceFormat = (asset: IAssetsBalance) => {
  const amount = isUnknownAsset(asset) ? asset.amount?.mul(10) : asset.amount;
  const formatOpts = isUnknownAsset(asset) && { precision: 0, units: 1 };

  return useMemo<BalanceFormat>(
    () => ({
      formattedBalance: amount?.format({
        precision: asset.precision ?? DEFAULT_MIN_PRECISION,
        units: asset.decimals,
        ...formatOpts,
      }),
      formattedBalanceFull:
        asset.amount &&
        format(amount, {
          precision: DEFAULT_DECIMAL_UNITS,
          units: asset.decimals,
          ...formatOpts,
        }),
    }),
    [asset, amount, formatOpts],
  );
};
