import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import type { IAssetsBalance } from '../../../../utils';
import { useBalanceFormat } from '../../hooks/useBalanceFormat';
import {
  BalanceTitle,
  BalanceValue,
  BalanceValueRow,
  BalanceWrapper,
} from './styles';

export interface BalanceProps {
  asset: IAssetsBalance;
  toggleHideAmount: () => void;
  hideAmount: boolean;
}

export const Balance = ({
  asset,
  toggleHideAmount,
  hideAmount,
}: BalanceProps) => {
  const { formattedBalance, formattedBalanceFull } = useBalanceFormat(asset);
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
