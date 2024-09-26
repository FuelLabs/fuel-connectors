import { useConnect, useDisconnect } from '@fuels/react';
import { useWallet } from '../hooks/useWallet';
import Button from './button';
import Feature from './feature';

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

  return (
    <Feature title="Your Fuel Address">
      <code className="block md:hidden">{truncAddressMiddle(account, 4)}</code>
      <code className="hidden md:block">{truncAddressMiddle(account, 8)}</code>
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
