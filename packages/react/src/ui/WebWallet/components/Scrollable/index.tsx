import type { IAssetsBalance } from '../../../../utils';
import { Divider } from '../../styles';
import { Assets } from '../Assets';
import { Balance } from '../Balance';
import { ScrollableContent, ScrollableWrapper } from './styles';

export interface ScrollableProps {
  mainAsset: IAssetsBalance;
  assetsBalances: IAssetsBalance[];
  hideAmount: boolean;
  toggleHideAmount: () => void;
}
export const Scrollable = ({
  mainAsset,
  hideAmount,
  toggleHideAmount,
  assetsBalances,
}: ScrollableProps) => {
  return (
    <ScrollableWrapper>
      <ScrollableContent>
        <Balance
          asset={mainAsset}
          hideAmount={hideAmount}
          toggleHideAmount={toggleHideAmount}
        />
        <Divider />
        <Assets assets={assetsBalances} hideAmount={hideAmount} />
      </ScrollableContent>
    </ScrollableWrapper>
  );
};
