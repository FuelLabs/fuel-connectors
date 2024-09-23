import { type FormatConfig, format } from 'fuels';
import { useMemo } from 'react';
import { type IAssetsBalance, isUnknownAsset } from '../types';

export const DEFAULT_MIN_PRECISION = 3;
export const DECIMAL_UNITS = 9;
export const formatOpts: FormatConfig = {
  units: DECIMAL_UNITS,
  precision: DECIMAL_UNITS,
};

export interface IBalanceFormat {
  formattedBalance: string;
  formattedBalanceFull: string;
}
export const useBalanceFormat = (asset: IAssetsBalance) =>
  useMemo<IBalanceFormat>(
    () => ({
      formattedBalance: asset.amount?.format({
        ...formatOpts,
        ...(isUnknownAsset(asset)
          ? {
              units: 1,
              precision: 0,
            }
          : {
              precision: asset.amount.isZero() ? 1 : DEFAULT_MIN_PRECISION,
              units: asset.decimals,
            }),
      }),
      formattedBalanceFull:
        asset.amount &&
        format(asset.amount, {
          ...formatOpts,
          units: asset.decimals,
        }),
    }),
    [asset, asset],
  );
