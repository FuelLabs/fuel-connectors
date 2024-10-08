import { useConnect, useDisconnect } from '@fuels/react';
import { type SyntheticEvent, useState } from 'react';
import { CopyIcon } from '../../../../packages/react/src/icons/CopyIcon';
import { useWallet } from '../hooks/useWallet';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function ConnectedAccount({ isSigning }: Props) {
  const { account, currentConnector, isConnected } = useWallet();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (!account && isConnected) {
    return (
      <Feature title="Your Fuel Address">
        Account not connected
        <Button
          onClick={() => connect(currentConnector.name)}
          loadingText="Disconnecting..."
          disabled={isSigning}
        >
          Connect
        </Button>
      </Feature>
    );
  }
  if (!account) return null;

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(account || '');
    setToast({
      open: true,
      type: 'success',
      children: 'Copied to clipboard',
    });
  }

  return (
    <Feature title="Your Fuel Address">
      <div className="flex items-center space-between" style={{ gap: '10px' }}>
        <code className="block md:hidden">
          {truncAddressMiddle(account, 4)}
        </code>
        <code className="hidden md:block">
          {truncAddressMiddle(account, 8)}
        </code>
        <CopyIcon
          size={16}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            handleCopy();
          }}
        />
      </div>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
      <Button
        onClick={() => disconnect()}
        loadingText="Disconnecting..."
        disabled={isSigning}
      >
        Disconnect
      </Button>
    </Feature>
  );
}

function truncAddressMiddle(address: string, size: number) {
  if (!address) return '';
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
