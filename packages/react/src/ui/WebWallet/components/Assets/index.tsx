import { IconCoins } from '@tabler/icons-react';
import { useMemo } from 'react';
import { BRIDGE_URL } from '../../../../config';
import { useConnectUI } from '../../../../providers';
import {
  type IAssetsBalance,
  isUnknownAsset,
  shortAddress,
} from '../../../../utils';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import { Container } from '../../styles';
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
  AssetsCardList,
  AssetsTitle,
  AssetsTitleWrapper,
  AssetsWrapper,
  NoAssetButton,
  NoAssetDescription,
} from './styles';

export interface AssetsProps {
  assets: IAssetsBalance[];
  hideAmount: boolean;
}

export const AssetsList = ({ assets, hideAmount }: AssetsProps) => {
  return (
    <AssetsWrapper>
      <AssetsTitleWrapper>
        <IconCoins color="var(--fuel-green-11)" stroke={1.5} />
        <AssetsTitle>Assets</AssetsTitle>
      </AssetsTitleWrapper>
      <AssetsCardList>
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
      </AssetsCardList>
    </AssetsWrapper>
  );
};

export const NoAssets = () => {
  const { bridgeURL } = useConnectUI();

  const bridgeHref = useMemo(() => {
    const url = new URL(bridgeURL || BRIDGE_URL);
    url.searchParams.set('from', 'eth');
    url.searchParams.set('to', 'fuel');
    url.searchParams.set('auto_close', 'true');
    return url.toString();
  }, [bridgeURL]);

  return (
    <Container $direction="column" $gap="16px">
      <NoAssetDescription>
        Looks like you don't have ETH balance, bridge funds to Fuel Ignition and
        use the application without stopping.
      </NoAssetDescription>
      <NoAssetButton href={bridgeHref} target="_blank">
        Bridge now
      </NoAssetButton>
    </Container>
  );
};

export const Assets = ({ assets, hideAmount }: AssetsProps) => {
  if (assets.length === 0) return <NoAssets />;

  return <AssetsList assets={assets} hideAmount={hideAmount} />;
};
