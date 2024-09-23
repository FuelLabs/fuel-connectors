import { type AssetFuel, type BN, DEFAULT_MIN_PRECISION, bn } from 'fuels';

export interface IAssetsBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: BN;
  decimals: number;
}

export const UnknownAsset: IAssetsBalance = {
  id: 'unknown',
  name: 'Unknown',
  symbol: 'UNK',
  icon: '',
  amount: bn(0),
  decimals: 0,
};

export const EmptyAsset: IAssetsBalance = {
  id: 'empty',
  name: 'Empty',
  symbol: 'ETH',
  icon: '',
  amount: bn(0),
  decimals: DEFAULT_MIN_PRECISION,
};

export const isUnknownAsset = (asset?: IAssetsBalance | AssetFuel) =>
  !asset || asset.symbol === UnknownAsset.symbol;
