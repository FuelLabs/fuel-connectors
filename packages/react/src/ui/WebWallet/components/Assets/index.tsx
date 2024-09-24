import { IconCoins } from '@tabler/icons-react';
import {
  type IAssetsBalance,
  handleCopy,
  isUnknownAsset,
  shortAddress,
} from '../../../../utils';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import { AvatarGenerated } from '../AvatarGenerated';
import { CopyButton } from '../CopyButton';
import {
  AssetCard,
  AssetCardAssetInfoName,
  AssetCardAssetInfoSymbol,
  AssetCardAssetInfoSymbolWrapper,
  AssetCardAssetInfoWrapper,
  AssetCardLeft,
  AssetCardValue,
  AssetsList,
  AssetsTitle,
  AssetsTitleWrapper,
  AssetsWrapper,
} from './styles';

export interface AssetsProps {
  assets: IAssetsBalance[];
  hideAmount: boolean;
}

export const Assets = ({ assets, hideAmount }: AssetsProps) => {
  return (
    <AssetsWrapper>
      <AssetsTitleWrapper>
        <IconCoins color="var(--fuel-green-11)" stroke={1.5} />
        <AssetsTitle>Assets</AssetsTitle>
      </AssetsTitleWrapper>
      <AssetsList>
        {assets.map((asset) => {
          const { formattedBalance, formattedBalanceFull: _ } =
            useBalanceFormat(asset);
          const valueOrHidden = hideAmount ? '•'.repeat(5) : formattedBalance;

          return (
            <AssetCard key={asset.id}>
              <AssetCardLeft>
                <AvatarGenerated src={asset.icon} hash={asset.id} />
                <AssetCardAssetInfoWrapper>
                  {!isUnknownAsset(asset) && (
                    <AssetCardAssetInfoName>
                      {asset?.name}
                    </AssetCardAssetInfoName>
                  )}
                  <AssetCardAssetInfoSymbolWrapper>
                    <AssetCardAssetInfoSymbol>
                      {isUnknownAsset(asset)
                        ? shortAddress(asset.id)
                        : asset.symbol}
                    </AssetCardAssetInfoSymbol>
                    <CopyButton size={18} address={asset.id} />
                  </AssetCardAssetInfoSymbolWrapper>
                </AssetCardAssetInfoWrapper>
              </AssetCardLeft>
              <AssetCardValue>{valueOrHidden}</AssetCardValue>
            </AssetCard>
          );
        })}
      </AssetsList>
    </AssetsWrapper>
  );
};
