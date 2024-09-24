import {
  type AssetFuel,
  type BN,
  DEFAULT_DECIMAL_UNITS,
  DEFAULT_MIN_PRECISION,
  bn,
} from 'fuels';

export interface IAssetsBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: BN;
  decimals: number;
  precision?: number;
}

export const UnknownAsset: IAssetsBalance = {
  id: 'unknown',
  name: 'Unknown',
  symbol: 'UNK',
  icon: '',
  amount: bn(0),
  decimals: 1,
  precision: 0,
};

export const EmptyEthAsset: IAssetsBalance = {
  id: '',
  name: '',
  symbol: 'ETH',
  icon: '',
  amount: bn(0),
  decimals: DEFAULT_DECIMAL_UNITS,
  precision: DEFAULT_MIN_PRECISION,
};

export const isUnknownAsset = (asset?: IAssetsBalance | AssetFuel) =>
  !asset || asset.symbol === UnknownAsset.symbol;

export const isEthAsset = (asset?: IAssetsBalance | AssetFuel) =>
  asset?.symbol === EmptyEthAsset.symbol;

export const sortingFn = (a: IAssetsBalance, b: IAssetsBalance) => {
  if (isEthAsset(a)) return -1;
  if (isEthAsset(b)) return 1;

  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
};
