import { HStack, Icon, Text, Tooltip, VStack } from '@fuels/ui';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import type { BN } from 'fuels';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';

export interface IBalanceProps {
  value: BN;
  toggleHideAmount: () => void;
  hideAmount: boolean;
}

export const Balance = ({
  value,
  toggleHideAmount,
  hideAmount,
}: IBalanceProps) => {
  const { formattedBalance, formattedBalanceFull } = useBalanceFormat(value);
  const normalProps = {
    value: formattedBalance,
    icon: IconEye,
    tooltip: formattedBalanceFull,
  };
  const hiddenProps = {
    value: '•'.repeat(5),
    icon: IconEyeClosed,
    tooltip: 'Hidden balance',
  };
  const props = hideAmount ? hiddenProps : normalProps;

  return (
    <VStack gap="1">
      <Text
        color="gray"
        size={{
          md: '2',
          initial: '1',
        }}
      >
        Balance
      </Text>
      <HStack gap="2" align="center">
        <Text
          size={{
            initial: '2',
            md: '5',
          }}
        >
          ETH
        </Text>
        <Tooltip content={props.tooltip} sideOffset={-5}>
          <Text
            size={{
              initial: '2',
              md: '5',
            }}
            aria-label={props.value}
          >
            {props.value}
          </Text>
        </Tooltip>
        <Icon onClick={toggleHideAmount} icon={props.icon} cursor="pointer" />
      </HStack>
    </VStack>
  );
};
