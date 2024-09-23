import { IconHistory } from '@tabler/icons-react';
import { Button } from './styles';

export const HistoryButton = ({ address }: { address: string }) => {
  return (
    <Button
      href={`https://app.fuel.network/account/${address}/transactions`}
      target="_blank"
      rel="noreferrer"
    >
      <IconHistory />
      History
    </Button>
  );
};
