import {
  Card,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  HStack,
  Icon,
  Table,
  Text,
  Tooltip,
  VStack,
} from '@fuels/ui';
import { IconCoins } from '@tabler/icons-react';
import { useGenerateBackground } from '../../hooks/useGenerateBackground';
import type { IAssetsBalance } from '../../types';
import { AvatarGenerated } from '../AvatarGenerated';
import { StyledColumnHeaderCell, StyledText } from './styles';

export interface IAssetsProps {
  assets: IAssetsBalance[];
}

export const Assets = ({ assets }: IAssetsProps) => {
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
        return (
          <Card className="max-w-xl" key={asset.id}>
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
                <EntityItemInfo id={tokenOrId} title={asset.name} />
              </EntityItem>

              <Text size="1" weight="regular">
                {asset.amount.format()}
              </Text>
            </HStack>
          </Card>
        );
      })}
    </VStack>
  );
};
