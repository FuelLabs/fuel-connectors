import { Inset, ScrollArea, Separator, VStack } from '@fuels/ui';
import type { IAssetsBalance } from '../../types';
import { Assets } from '../Assets';
import { Balance } from '../Balance';

export interface ScrollableContentProps {
  mainAsset: IAssetsBalance;
  assetsBalances: IAssetsBalance[];
  hideAmount: boolean;
  toggleHideAmount: () => void;
}
export const ScrollableContent = ({
  mainAsset,
  hideAmount,
  toggleHideAmount,
  assetsBalances,
}: ScrollableContentProps) => {
  return (
    <Inset side="x">
      <ScrollArea scrollbars="vertical" type="auto">
        <VStack gap="3" className="px-4">
          <Separator size="4" className="min-h-px" />
          <Balance
            value={mainAsset?.amount}
            decimals={mainAsset?.decimals}
            hideAmount={hideAmount}
            toggleHideAmount={toggleHideAmount}
          />
          <Separator size="4" className="min-h-px" />
          <Assets assets={assetsBalances} hideAmount={hideAmount} />
        </VStack>
      </ScrollArea>
    </Inset>
  );
};
