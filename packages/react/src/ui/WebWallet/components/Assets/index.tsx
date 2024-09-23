import { IconCoins } from '@tabler/icons-react';
import { handleCopy, shortAddress } from '../../../../utils';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import { type IAssetsBalance, isUnknownAsset } from '../../types';
import { AvatarGenerated } from '../AvatarGenerated';
import { Tooltip } from '../Tooltip';
import {
  AssetCard,
  AssetCardAssetInfoCopy,
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
                    <Tooltip value={asset.id}>
                      <AssetCardAssetInfoSymbol>
                        {isUnknownAsset(asset)
                          ? shortAddress(asset.id)
                          : asset.symbol}
                      </AssetCardAssetInfoSymbol>
                    </Tooltip>
                    <AssetCardAssetInfoCopy
                      size={18}
                      onClick={() => handleCopy(asset.id)}
                    />
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
  // return (
  //   <VStack
  //   gap={{
  //     md: '3',
  //     initial: '2',
  //   }}
  // >
  //   <HStack gap="1" align="center">
  //     <Icon icon={IconCoins} />
  //     <Text
  //       size={{
  //         md: '3',
  //         initial: '1',
  //       }}
  //       weight="medium"
  //     >
  //       Assets
  //     </Text>
  //   </HStack>
  //   <VStack gap="1">
  //     {assets.map((asset) => {
  //       const { formattedBalance, formattedBalanceFull } = useBalanceFormat(
  //         asset.amount,
  //         asset.decimals,
  //       );
  //       const valueOrHidden = hideAmount ? '•'.repeat(5) : formattedBalance;
  //       const tokenOrId = asset.symbol === 'UNK' ? asset.id : asset.symbol;

  //       return (
  //         <Card key={asset.id} variant="classic" p={'4'}>
  //           <HStack align="center" justify="between">
  //             <EntityItem key={asset.id}>
  //               <EntityItemSlot>
  //                 <AvatarGenerated
  //                   size="2"
  //                   src={asset.icon}
  //                   hash={asset.id}
  //                 />
  //               </EntityItemSlot>
  //               <EntityItemInfo
  //                 id={tokenOrId}
  //                 title={
  //                   (
  //                     <Text size="2" color="gray" highContrast>
  //                       {asset.name}
  //                     </Text>
  //                   ) as string & React.ReactElement
  //                 }
  //               />
  //             </EntityItem>

  //             <Tooltip content={formattedBalanceFull}>
  //               <Text size="2" weight="regular" color="gray" highContrast>
  //                 {valueOrHidden}
  //               </Text>
  //             </Tooltip>
  //           </HStack>
  //         </Card>
  //       );
  //     })}
  //   </VStack>
  // </VStack>
  // );
};
