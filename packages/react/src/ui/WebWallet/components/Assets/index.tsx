import {
  Card,
  Container,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from '@fuels/ui';
import { IconCoins } from '@tabler/icons-react';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import { useGenerateBackground } from '../../hooks/useGenerateBackground';
import type { IAssetsBalance } from '../../types';
import { AvatarGenerated } from '../AvatarGenerated';

export interface IAssetsProps {
  assets: IAssetsBalance[];
  hideAmount: boolean;
}

export const Assets = ({ assets, hideAmount }: IAssetsProps) => {
  return (
    <VStack
      gap={{
        md: '3',
        initial: '2',
      }}
    >
      <HStack gap="1" align="center">
        <Icon icon={IconCoins} />
        <Text
          size={{
            md: '3',
            initial: '1',
          }}
          weight="medium"
        >
          Assets
        </Text>
      </HStack>
      <VStack gap="1">
        {assets.map((asset) => {
          const { formattedBalance } = useBalanceFormat(asset.amount);
          const valueOrHidden = hideAmount ? '•'.repeat(5) : formattedBalance;
          const tokenOrId = asset.symbol === 'UNK' ? asset.id : asset.symbol;
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
    </VStack>
  );
};
