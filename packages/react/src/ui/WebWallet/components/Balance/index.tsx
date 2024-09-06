import { HStack, Icon, Text, VStack } from '@fuels/ui';
import { IconEyeClosed, IconEyeOff, IconEyeX } from '@tabler/icons-react';
import { IconEye } from '@tabler/icons-react';

export interface IBalanceProps {
  value: string | null;
  toggleHideAmount: () => void;
  hideAmount: boolean;
}
export const Balance = ({
  value,
  toggleHideAmount,
  hideAmount,
}: IBalanceProps) => {
  const valueOrHidden = hideAmount ? '••••••' : value;
  const icon = hideAmount ? IconEyeClosed : IconEye;
  return (
    <VStack gap="1">
      <Text color="gray" size="2">
        Balance
      </Text>
      <HStack gap="2" align="center">
        <Text size="5">ETH</Text>
        <Text size="5">{valueOrHidden}</Text>
        <Icon onClick={toggleHideAmount} icon={icon} cursor="pointer" />
      </HStack>
    </VStack>
  );
};
