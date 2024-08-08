import { Address } from 'fuels';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';
import { DEFAULT_AMOUNT } from './balance';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

const DEFAULT_ADDRESS = Address.fromRandom().toB256();

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function Transfer({ isSigning, setIsSigning }: Props) {
  const { balance, wallet, refetchWallet } = useWallet();

  const [receiver, setReceiver] = useState(DEFAULT_ADDRESS);
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const hasBalance = balance?.gte(DEFAULT_AMOUNT);

  const handleTransfer = async () => {
    setLoading(true);
    setIsSigning(true);
    try {
      if (!receiver) {
        throw Error('Invalid address');
      }

      const receiverAddress = Address.fromString(receiver);
      const asset_id = wallet?.provider.getBaseAssetId();

      const resp = await wallet?.transfer(
        receiverAddress,
        DEFAULT_AMOUNT,
        asset_id,
        {
          gasLimit: 150_000,
          maxFee: 150_000,
        },
      );

      setToast({
        open: true,
        type: 'success',
        children: 'Transaction submitted!',
      });

      // after 3 seconds we'll check if transaction is done
      const TIME_TO_WAIT = 3000;
      setTimeout(() => {
        // execute this inside timeout to avoid block the user flow
        async function checkResult() {
          if (wallet) {
            const result = await resp?.waitForResult();

            setToast({
              open: true,
              type: 'success',
              children: (
                <p>
                  Transferred successfully! View it on the{' '}
                  <a
                    href={`https://app.fuel.network/tx/${result.id}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    block explorer
                  </a>
                </p>
              ),
            });
          }
        }

        checkResult();
      }, TIME_TO_WAIT);
    } catch (err) {
      const error = err as CustomError;
      console.error(error.message);

      setToast({
        open: true,
        type: 'error',
        children: `The transfer could not be processed: ${
          error.message.includes('Invalid B256 Address')
            ? 'Invalid address'
            : error.message.substring(0, 32)
        }...`,
      });
    } finally {
      setLoading(false);
      setIsSigning(false);
      refetchWallet();
    }
  };

  return (
    <Feature title="Transfer">
      <input
        type="text"
        placeholder="Receiver address"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        className="-ml-1 mr-2 mt-1 w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 p-1 font-mono outline-none md:-ml-2 md:mt-2 md:p-2 dark:bg-transparent"
      />

      <Button
        onClick={handleTransfer}
        disabled={isLoading || !hasBalance || isSigning}
        className="mt-1 shrink-0 md:mt-2"
        loading={isLoading}
        loadingText="Transferring..."
      >
        {`Transfer ${DEFAULT_AMOUNT.format()} ETH`}
      </Button>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </Feature>
  );
}
