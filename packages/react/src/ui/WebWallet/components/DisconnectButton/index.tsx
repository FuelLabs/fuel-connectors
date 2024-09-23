import { IconLogout } from '@tabler/icons-react';

export interface DisconnectButtonProps {
  disconnect: () => void;
}

export const DisconnectButton = ({ disconnect: _ }: DisconnectButtonProps) => {
  return 'DISCONNECT BUTTON';
  // return (
  //   <Button
  //     color="red"
  //     size="2"
  //     leftIcon={IconLogout}
  //     onClick={() => disconnect()}
  //     className="flex-1"
  //     variant="outline"
  //   >
  //     Disconnect
  //   </Button>
  // );
};
