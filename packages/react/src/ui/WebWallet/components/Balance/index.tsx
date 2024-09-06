import { Text, VStack } from '@fuels/ui';

export interface IBalanceProps {
  value: string | null;
}
export const Balance = ({ value }: IBalanceProps) => {
  return (
    <VStack gap="1">
      <Text color="gray" size="2">
        Balance
      </Text>
      <Text size="5">{value} ETH</Text>
    </VStack>
  );
};
