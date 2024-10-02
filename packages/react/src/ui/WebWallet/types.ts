import type { BN } from 'fuels';

export interface IAssetsBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: BN;
  decimals: number;
}
