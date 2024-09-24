import { type FormatConfig, format } from 'fuels';
import { useMemo } from 'react';
import type { IAssetsBalance } from '../../../utils';

export const DEFAULT_MIN_PRECISION = 3;
export const DECIMAL_UNITS = 9;
export const formatOpts: FormatConfig = {
  units: DECIMAL_UNITS,
  precision: DECIMAL_UNITS,
};

export interface BalanceFormat {
  formattedBalance: string;
  formattedBalanceFull: string;
}
export const useBalanceFormat = (asset: IAssetsBalance) =>
  useMemo<BalanceFormat>(
    () => ({
      formattedBalance: asset.amount?.format({
        ...formatOpts,
        precision: asset.precision ?? DEFAULT_MIN_PRECISION,
        units: asset.decimals,
      }),
      formattedBalanceFull:
        asset.amount &&
        format(asset.amount, {
          ...formatOpts,
          units: asset.decimals,
        }),
    }),
    [asset],
  );
