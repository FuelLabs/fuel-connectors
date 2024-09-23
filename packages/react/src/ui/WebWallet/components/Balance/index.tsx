import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import type { BN } from 'fuels';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import {
  BalanceTitle,
  BalanceValue,
  BalanceValueRow,
  BalanceWrapper,
} from './styles';
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
    <BalanceWrapper>
      <BalanceTitle>Balance</BalanceTitle>
      <BalanceValueRow>
        <BalanceValue>ETH</BalanceValue>
        <BalanceValue>{props.value}</BalanceValue>
        <IconEye
          onClick={toggleHideAmount}
          cursor="pointer"
          stroke={1.5}
          size={22}
        />
      </BalanceValueRow>
    </BalanceWrapper>
  );
};
