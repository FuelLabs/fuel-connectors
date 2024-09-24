import { IconLogout } from '@tabler/icons-react';
import { Button } from './stylex';

export interface DisconnectButtonProps {
  disconnect: () => void;
}

export const DisconnectButton = ({ disconnect }: DisconnectButtonProps) => {
  return (
    <Button onClick={() => disconnect()}>
      <IconLogout size={18} />
      Disconnect
    </Button>
  );
};
