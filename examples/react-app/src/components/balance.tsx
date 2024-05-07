import { bn } from 'fuels';
import { useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import Feature from './feature';

export const DEFAULT_AMOUNT = bn.parseUnits('0.0001');

const BalanceSkeleton = () => (
  <div className="h-6 w-28 animate-pulse bg-gray-800" />
);

export default function Balance() {
  const { refetchWallet, balance, address } = useWallet();

  useEffect(() => {
    const interval = setInterval(() => refetchWallet(), 5000);
    return () => clearInterval(interval);
  }, [refetchWallet]);

  return (
    <Feature title="Balance">
      <code>{balance ? `${balance?.format()} ETH` : <BalanceSkeleton />}</code>
      <a
        href={`https://faucet-devnet.fuel.network/?address=${address}`}
        target="_blank"
        className="btn btn-primary"
        rel="noreferrer"
      >
        Get coins
      </a>
    </Feature>
  );
}
