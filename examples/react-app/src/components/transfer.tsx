import { Address } from 'fuels';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

const DEFAULT_ADDRESS =
  '0xa671949e92e3cf75a497f6759c785336308f8867b677defe1ba71d5979197baf';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function Transfer({ isSigning, setIsSigning }: Props) {
  const { balance, wallet, refetchBalance } = useWallet();
  const { defaultAmount, explorerUrl } = useConfig();

  const [receiver, setReceiver] = useState(DEFAULT_ADDRESS);
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const hasBalance = balance?.gte(defaultAmount);

  const handleTransfer = async () => {
    setLoading(true);
    setIsSigning(true);
    try {
      if (!receiver) {
        throw Error('Invalid address');
      }

      const receiverAddress = Address.fromString(receiver);
      const asset_id = await wallet?.provider.getBaseAssetId();

      const resp = await wallet?.transfer(
        receiverAddress,
        defaultAmount,
        asset_id,
      );

      setToast({
        open: true,
        type: 'success',
        children: 'Transaction submitted!',
      });

      // after 3 seconds we'll check if transaction is done
      const TIME_TO_WAIT = 3000;
      const checkTimeout = setTimeout(() => {
        checkResult();
      }, TIME_TO_WAIT);

      const checkResult = async () => {
        const result = await resp?.waitForResult();
        refetchBalance();
        setLoading(false);
        setIsSigning(false);
        setToast({
          open: true,
          type: 'success',
          children: (
            <p>
              Transferred successfully! View it on the{' '}
              <a
                href={`${explorerUrl}/tx/${result?.id}`}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                block explorer
              </a>
            </p>
          ),
        });
        clearInterval(checkTimeout);
      };
    } catch (err) {
      const error = err as CustomError;
      console.error(error);

      setToast({
        open: true,
        type: 'error',
        children: `The transfer could not be processed: ${
          error.message.includes('Invalid B256 Address')
            ? 'Invalid address'
            : error.message.substring(0, 32)
        }...`,
      });

      setLoading(false);
      setIsSigning(false);
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
        {`Transfer ${defaultAmount.format()} ETH`}
      </Button>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </Feature>
  );
}
