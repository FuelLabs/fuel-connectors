import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { Counter } from '../types';

import type { CustomError } from '../utils/customError';

import { useConfig } from '../context/ConfigContext';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function ContractCounter({ isSigning, setIsSigning }: Props) {
  const { balance, wallet, refetchBalance } = useWallet();

  const { defaultAmount, counterContractId, explorerUrl } = useConfig();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const hasBalance = balance?.gte(defaultAmount);

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
      const contract = new Counter(counterContractId, wallet);
      try {
        const txRequest = await contract.functions
          .increment_counter()
          .getTransactionRequest();

        await txRequest.estimateAndFund(wallet);

        const { waitForResult } = await wallet.sendTransaction(txRequest, {
          skipCustomFee: true,
        });

        setToast({
          open: true,
          type: 'success',
          children: 'Transaction submitted!',
        });

        getCount();

        if (waitForResult) {
          const checkResult = async () => {
            const tx = await waitForResult();

            await getCount();
            setToast({
              open: true,
              type: 'success',
              children: (
                <p>
                  Counter incremented! View it on the{' '}
                  <a
                    href={`${explorerUrl}/tx/${tx.transactionId}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    block explorer
                  </a>
                </p>
              ),
            });

            refetchBalance();
            setLoading(false);
            setIsSigning(false);
          };

          checkResult();
        }
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
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  async function getCount() {
    if (!wallet) return;

    const counterContract = new Counter(counterContractId, wallet);

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
