import {
  Card,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  HStack,
  Icon,
  Text,
  VStack,
} from '@fuels/ui';
import { IconCoins } from '@tabler/icons-react';
import { useGenerateBackground } from '../../hooks/useGenerateBackground';
import type { IAssetsBalance } from '../../types';
import { AvatarGenerated } from '../AvatarGenerated';

export interface IAssetsProps {
  assets: IAssetsBalance[];
  hideAmount: boolean;
}

export const Assets = ({ assets, hideAmount }: IAssetsProps) => {
  return (
    <VStack gap="3">
      <HStack gap="1" align="center">
        <Icon icon={IconCoins} />
        <Text size="3" weight="medium">
          Assets
        </Text>
      </HStack>
      {assets.map((asset) => {
        const tokenOrId = asset.symbol === 'UNK' ? asset.id : asset.symbol;
        const value = asset.amount.format({
          precision: 4,
        });
        const valueOrHidden = hideAmount ? '••••••' : value;
        return (
          // @ts-expect-error Card does have variant
          <Card key={asset.id} variant="classic">
            <HStack align="center" justify="between">
              <EntityItem key={asset.id}>
                <EntityItemSlot>
                  <AvatarGenerated
                    fallback=""
                    size="2"
                    src={asset.icon}
                    background={useGenerateBackground(asset.id)}
                  />
                </EntityItemSlot>
                <EntityItemInfo
                  id={tokenOrId}
                  title={
                    (
                      <Text size="2" color="gray" highContrast>
                        {asset.name}
                      </Text>
                    ) as string & React.ReactElement
                  }
                />
              </EntityItem>

              <Text size="2" weight="regular" color="gray" highContrast>
                {valueOrHidden}
              </Text>
            </HStack>
          </Card>
        );
      })}
    </VStack>
  );
};
