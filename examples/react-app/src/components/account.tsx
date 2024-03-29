import { useDisconnect } from '@fuel-wallet/react';
import Button from './button';
import Feature from './feature';
import { useWallet } from '../hooks/useWallet';

export default function ConnectedAccount() {
  const { address } = useWallet();

  const { disconnect } = useDisconnect();

  return (
    <Feature title="Your Fuel Address">
      <code className="block md:hidden">{truncAddressMiddle(address, 4)}</code>
      <code className="hidden md:block">{truncAddressMiddle(address, 8)}</code>
      <Button onClick={() => disconnect()} loadingText="Disconnecting...">
        Disconnect
      </Button>
    </Feature>
  );
}

function truncAddressMiddle(address: string, size: number) {
  if (!address) return '';
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
