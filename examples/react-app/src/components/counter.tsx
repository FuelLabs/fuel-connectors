import { bn } from 'fuels';
import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { CounterAbi__factory } from '../types';
import { counter as COUNTER_CONTRACT_ID } from '../types/contract-ids.json';
import type { CustomError } from '../utils/customError';
import { DEFAULT_AMOUNT } from './balance';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function ContractCounter({ isSigning, setIsSigning }: Props) {
  const { balance, wallet } = useWallet();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const hasBalance = balance?.gte(DEFAULT_AMOUNT);

  useLogEvents();

  useEffect(() => {
    if (wallet) {
      getCount();
    }
  }, [wallet]);

  return (
    <div>
      <Feature title="Counter Contract">
        <code>{counter}</code>
        <div className="space-x-2">
          <Button
            onClick={increment}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Incrementing..."
          >
            Increment
          </Button>
          <Notification
            setOpen={() => setToast({ ...toast, open: false })}
            {...toast}
          />
        </div>
      </Feature>
      <ContractLink />
    </div>
  );

  async function increment() {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      const contract = CounterAbi__factory.connect(COUNTER_CONTRACT_ID, wallet);
      try {
        await contract.functions
          .increment_counter()
          .txParams({ gasLimit: bn(200_000), maxFee: bn(150_000) })
          .call();

        getCount();

        setToast({
          open: true,
          type: 'success',
          children: 'Counter incremented!',
        });
      } catch (err) {
        const error = err as CustomError;

        console.error('error sending transaction...', error.message);
        setToast({
          open: true,
          type: 'error',
          children: `The counter could not be incremented: ${error.message.substring(
            0,
            32,
          )}...`,
        });
      } finally {
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  async function getCount() {
    if (!wallet) return;

    const counterContract = CounterAbi__factory.connect(
      COUNTER_CONTRACT_ID,
      wallet,
    );

    try {
      const { value } = await counterContract.functions
        .get_count()
        .txParams({ gasLimit: 100_000 })
        .get();
      setCounter(value.toNumber());
    } catch (error) {
      console.error(error);
    }
  }
}
