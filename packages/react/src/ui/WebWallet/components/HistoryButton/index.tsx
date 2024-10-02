import { Button } from '@fuels/ui';
import { IconHistory } from '@tabler/icons-react';

export const HistoryButton = ({ address }: { address: string }) => {
  return (
    <Button
      as="a"
      href={`https://app.fuel.network/account/${address}/transactions`}
      target="_blank"
      rel="noreferrer"
      size="2"
      leftIcon={IconHistory}
      color="gray"
      className="flex-1"
      variant="outline"
    >
      History
    </Button>
  );
};
