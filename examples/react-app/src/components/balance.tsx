import { bn } from 'fuels';
import { useWallet } from '../hooks/useWallet';
import { Faucet } from './faucet';
import Feature from './feature';

export const DEFAULT_AMOUNT = bn.parseUnits('0.0001');

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const BalanceSkeleton = () => (
  <div className="h-6 w-28 animate-pulse bg-gray-800" />
);

export default function Balance({ isSigning }: Props) {
  const { balance, account } = useWallet();
  if (!account) return null;
  return (
    <Feature title="Balance">
      <code>{balance ? `${balance?.format()} ETH` : <BalanceSkeleton />}</code>
      <Faucet isSigning={isSigning} address={account} />
    </Feature>
  );
}
