import { useDisconnect } from '@fuels/react';
import { useWallet } from '../hooks/useWallet';
import Button from './button';
import Feature from './feature';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function ConnectedAccount({ isSigning }: Props) {
  const { address } = useWallet();

  const { disconnect } = useDisconnect();

  return (
    <Feature title="Your Fuel Address">
      <code className="block md:hidden">{truncAddressMiddle(address, 4)}</code>
      <code className="hidden md:block">{truncAddressMiddle(address, 8)}</code>
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
