import { useEffect, useState } from 'react';
import { CounterContractAbi__factory } from '../contracts';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';
import { DEFAULT_AMOUNT } from './balance';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

export const COUNTER_CONTRACT_ID =
  '0x0a46aafb83b387155222893b52ed12e5a4b9d6cd06770786f2b5e4307a63b65c';

export default function ContractCounter() {
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
    <Feature title="Counter Contract">
      <code>{counter}</code>
      <div className="space-x-2">
        <Button
          color="secondary"
          onClick={() =>
            alert(`The counter contract is deployed at ${COUNTER_CONTRACT_ID}`)
          }
        >
          See Address
        </Button>
        <Button
          onClick={increment}
          disabled={isLoading || !hasBalance}
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
  );

  async function increment() {
    if (wallet) {
      setLoading(true);
      const contract = CounterContractAbi__factory.connect(
        COUNTER_CONTRACT_ID,
        wallet,
      );
      try {
        await contract.functions
          .increment()
          .txParams({ gasPrice: 1, gasLimit: 100_000 })
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
      }
    }
  }

  async function getCount() {
    if (!wallet) return;

    const counterContract = CounterContractAbi__factory.connect(
      COUNTER_CONTRACT_ID,
      wallet,
    );

    try {
      const { value } = await counterContract.functions
        .count()
        .txParams({ gasPrice: 1, gasLimit: 100_000 })
        .get();
      setCounter(value.toNumber());
    } catch (error) {
      console.error(error);
    }
  }
}
