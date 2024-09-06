import { Card, Text, VStack } from '@fuels/ui';

export interface IBalanceProps {
  value: string | null;
}
export const Balance = ({ value }: IBalanceProps) => {
  return (
    <Card className="max-w-xl">
      <VStack gap="0">
        <Text color="gray" size="1">
          Total Balance
        </Text>
        <Text size="6">{value} ETH</Text>
      </VStack>
    </Card>
  );
};
