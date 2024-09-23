import {
  Card,
  EntityItem,
  EntityItemInfo,
  EntityItemSlot,
  HStack,
  Icon,
  Text,
  Tooltip,
  VStack,
} from '@fuels/ui';
import { IconCoins } from '@tabler/icons-react';
import { tv } from 'tailwind-variants';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import type { IAssetsBalance } from '../../types';
import { AvatarGenerated } from '../AvatarGenerated';

export interface AssetsProps {
  assets: IAssetsBalance[];
  hideAmount: boolean;
}

export const Assets = ({ assets, hideAmount }: AssetsProps) => {
  const classes = styles();
  return (
    <VStack gap="4">
      <HStack gap="1" align="center">
        <Icon
          icon={IconCoins}
          size={24}
          style={{ color: '#00f58c' }}
          stroke={1.6}
        />
        <Text size="4" weight="medium" className="ml-1">
          Assets
        </Text>
      </HStack>
      <VStack gap="2">
        {assets.map((asset) => {
          const { formattedBalance, formattedBalanceFull } = useBalanceFormat(
            asset.amount,
            asset.decimals,
          );
          const valueOrHidden = hideAmount ? '•'.repeat(5) : formattedBalance;
          const tokenOrId = asset.symbol === 'UNK' ? asset.id : asset.symbol;

          return (
            <Card key={asset.id} variant="classic" p={'4'}>
              <HStack align="center" justify="between">
                <EntityItem key={asset.id}>
                  <EntityItemSlot>
                    <AvatarGenerated
                      style={{
                        width: '40px',
                        height: '40px',
                      }}
                      src={asset.icon}
                      hash={asset.id}
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

                <Tooltip content={formattedBalanceFull}>
                  <Text
                    size="2"
                    weight="regular"
                    color="gray"
                    highContrast
                    className={classes.assetValue()}
                  >
                    {valueOrHidden}
                  </Text>
                </Tooltip>
              </HStack>
            </Card>
          );
        })}
      </VStack>
    </VStack>
  );
};

const styles = tv({
  slots: {
    assetValue: 'text-muted text-sm',
  },
});
