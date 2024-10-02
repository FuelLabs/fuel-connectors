import { Button } from '@fuels/ui';
import { IconWallet } from '@tabler/icons-react';
import React from 'react';

export interface AnchorProps {
  address: string;
  onClick?: () => void;
  isLoading: boolean;
  isConnected: boolean;
}

const AnchorComponent = (
  { address, onClick, isLoading, isConnected }: AnchorProps,
  ref: React.ForwardedRef<HTMLButtonElement> | null,
) => {
  return (
    <Button
      radius="full"
      onClick={onClick}
      leftIcon={IconWallet}
      size={'2'}
      isLoading={isLoading && isConnected}
      disabled={!isConnected}
      ref={ref}
      color="gray"
    >
      {address && isConnected ? address : 'Connect your wallet'}
    </Button>
  );
};

export const Anchor = React.forwardRef(AnchorComponent);
