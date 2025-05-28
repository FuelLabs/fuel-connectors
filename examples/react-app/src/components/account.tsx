import { useConnect, useDisconnect } from '@fuels/react';
import { useConfig } from '../context/ConfigContext';
import { useWallet } from '../hooks/useWallet';
import { Copyable } from './Copyable';
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
  const { explorerUrl } = useConfig();

  const explorerAccountUrl = `${explorerUrl}/account/${account}/assets`;

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
    <div>
      <Feature title="Your Fuel Address">
        <div
          className="flex items-center space-between"
          style={{ gap: '10px' }}
          id="address"
          data-address={account}
        >
          <code className="block md:hidden">
            {truncAddressMiddle(account, 4)}
          </code>
          <code className="hidden md:block">
            {truncAddressMiddle(account, 8)}
          </code>
          <Copyable value={account} />
        </div>
        <Button
          onClick={() => disconnect()}
          loadingText="Disconnecting..."
          disabled={isSigning}
        >
          Disconnect
        </Button>
      </Feature>
      <a
        href={explorerAccountUrl}
        target="_blank"
        className="underline text-end text-sm text-zinc-300/70"
        rel="noreferrer"
      >
        View on Explorer
      </a>
    </div>
  );
}

function truncAddressMiddle(address: string, size: number) {
  if (!address) return '';
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
