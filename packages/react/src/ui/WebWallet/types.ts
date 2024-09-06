import { type BN, bn } from 'fuels';

export interface IAssetsBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: BN;
}
export const DEFAULT_ETH_IMAGE = 'https://cdn.fuel.network/assets/eth.svg';
export const LEGACY_ETH_ID =
  '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';
export const defaultAssetsBalance: IAssetsBalance[] = [
  {
    id: LEGACY_ETH_ID,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: DEFAULT_ETH_IMAGE,
    amount: bn(0),
  },
] as IAssetsBalance[];
