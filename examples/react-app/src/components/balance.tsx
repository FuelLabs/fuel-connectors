import { bn } from 'fuels';
import { useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
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
  const { refetchWallet, balance, address } = useWallet();

  useEffect(() => {
    const interval = setInterval(() => refetchWallet(), 5000);
    return () => clearInterval(interval);
  }, [refetchWallet]);

  return (
    <Feature title="Balance">
      <code>{balance ? `${balance?.format()} ETH` : <BalanceSkeleton />}</code>
      <a
        href={`https://faucet-beta-5.fuel.network/?address=${address}`}
        target="_blank"
        className={`btn ${
          isSigning
            ? 'cursor-not-allowed border border-zinc-400/25 bg-zinc-950 text-zinc-400'
            : 'btn-primary'
        }`}
        rel="noreferrer"
        onClick={(e) => {
          if (isSigning) {
            e.preventDefault();
          }
        }}
      >
        Get coins
      </a>
    </Feature>
  );
}
