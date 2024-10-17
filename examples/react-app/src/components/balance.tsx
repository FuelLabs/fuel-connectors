import { bn } from 'fuels';
import { useConfig } from '../context/ConfigContext';
import { useWallet } from '../hooks/useWallet';
import { Faucet } from './faucet';
import Feature from './feature';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const BalanceSkeleton = () => (
  <div className="h-6 w-28 animate-pulse bg-gray-800" />
);

export default function Balance({ isSigning }: Props) {
  const { balance, account, isConnected } = useWallet();
  const { chainIdName } = useConfig();

  if (!account && isConnected) {
    return (
      <Feature title="Balance">
        <code>{bn(0).format()} ETH</code>
        <Faucet isSigning={isSigning} address={account || ''} disabled={true} />
      </Feature>
    );
  }
  if (!account) return null;

  return (
    <Feature title="Balance">
      <code>{balance ? `${balance?.format()} ETH` : <BalanceSkeleton />}</code>
      <Faucet
        isSigning={isSigning}
        address={account}
        disabled={chainIdName === 'mainnet'}
      />
    </Feature>
  );
}
