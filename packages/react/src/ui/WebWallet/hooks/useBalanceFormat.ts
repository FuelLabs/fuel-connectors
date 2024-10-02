import { type BN, type FormatConfig, format } from 'fuels';
import { useMemo } from 'react';

export const DEFAULT_MIN_PRECISION = 3;
export const DECIMAL_UNITS = 9;
export const formatOpts: FormatConfig = {
  units: DECIMAL_UNITS,
  precision: DECIMAL_UNITS,
};

export type IBalanceFormat = {
  formattedBalance: string;
  formattedBalanceFull: string;
};
export const useBalanceFormat = (value: BN, decimals: number) =>
  useMemo<IBalanceFormat>(
    () => ({
      formattedBalance: value.format({
        ...formatOpts,
        precision: value.isZero() ? 1 : DEFAULT_MIN_PRECISION,
        units: decimals,
      }),
      formattedBalanceFull: format(value, {
        ...formatOpts,
        units: decimals,
      }),
    }),
    [value, decimals],
  );
