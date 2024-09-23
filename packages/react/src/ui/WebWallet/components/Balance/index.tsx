import { HStack, Icon, Text, Tooltip, VStack } from '@fuels/ui';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import type { BN } from 'fuels';
import { tv } from 'tailwind-variants';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';

export interface BalanceProps {
  value: BN;
  decimals: number;
  toggleHideAmount: () => void;
  hideAmount: boolean;
}

export const Balance = ({
  value,
  decimals,
  toggleHideAmount,
  hideAmount,
}: BalanceProps) => {
  const { formattedBalance, formattedBalanceFull } = useBalanceFormat(
    value,
    decimals,
  );
  const classes = styles();
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
      <Text className={classes.balanceTitle()}>Balance</Text>
      <HStack gap="2" align="center">
        <Tooltip content={props.tooltip} sideOffset={-5}>
          <Text className={classes.balanceValue()} aria-label={props.value}>
            ETH&nbsp;&nbsp;
            {props.value}
          </Text>
        </Tooltip>
        <Icon onClick={toggleHideAmount} icon={props.icon} cursor="pointer" />
      </HStack>
    </VStack>
  );
};

const styles = tv({
  slots: {
    balanceTitle: 'text-sm text-muted',
    balanceValue: 'text-2xl tracking-widest text-gray-7',
  },
});
