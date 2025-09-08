import { useSignTransaction } from '@fuels/react';
import { Address } from 'fuels';
import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';
import { Copyable } from './Copyable';
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
  const { defaultAmount, explorerUrl, assetId, assetSymbol } = useConfig();
  const { signTransactionAsync } = useSignTransaction();

  const [receiver, setReceiver] = useState(DEFAULT_ADDRESS);
  const [isLoading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [signedTransaction, setSignedTransaction] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const hasBalance = balance?.gte(defaultAmount);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleTransfer = async () => {
    setLoading(true);
    setIsSigning(true);
    try {
      if (!receiver) {
        throw Error('Invalid address');
      }

      const receiverAddress = Address.fromString(receiver);
      const asset_id = assetId ?? (await wallet?.provider.getBaseAssetId());

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

      setLoading(false);
      setIsSigning(false);
    }
  };

  async function handleSignTransfer() {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      try {
        if (!receiver) throw Error('Invalid address');
        const receiverAddress = Address.fromString(receiver);

        const asset_id = assetId ?? (await wallet?.provider.getBaseAssetId());

        // Create the transfer transaction request using wallet.createTransfer()
        const tx = await wallet.createTransfer(
          receiverAddress,
          defaultAmount,
          asset_id,
          // You can add optional txParams here if needed, e.g., { gasLimit: 10000 }
        );

        if (!tx) {
          throw Error('Failed to create transfer transaction request');
        }

        // Sign the transaction without broadcasting it
        const txRequestSigned = await signTransactionAsync({
          address: wallet.address.toString(),
          transaction: tx,
        });

        if (typeof txRequestSigned !== 'string' && txRequestSigned.witnesses) {
          const signature = txRequestSigned.witnesses[0];

          setSignedTransaction(signature.toString() || null);
          setToast({
            open: true,
            type: 'success',
            children: (
              <div>
                <div>Transaction signed successfully!</div>
              </div>
            ),
          });
        }
      } catch (error) {
        setToast({
          open: true,
          type: 'error',
          children: `Failed to sign transaction: ${(error as Error).message}`,
        });
      } finally {
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  return (
    <div>
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
          {`Transfer ${defaultAmount.format()} ${assetSymbol}`}
        </Button>
        <div className="relative inline-block ml-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="mt-1 shrink-0 md:mt-2"
            disabled={isLoading || !hasBalance || isSigning}
          >
            ▼
          </Button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignTransfer();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                >
                  Sign Transfer
                </button>
              </div>
            </div>
          )}
        </div>

        <Notification
          setOpen={() => setToast({ ...toast, open: false })}
          {...toast}
        />
      </Feature>
      {signedTransaction && (
        <div className="mt-4">
          <h3 className="flex mt-3 mb-1 text-sm font-medium md:mb-0 dark:text-zinc-300/70">
            Signed Transaction
            <div className="ml-2">
              <Copyable value={signedTransaction} />
            </div>
          </h3>
          <p className="whitespace-pre-wrap max-w-full break-words">
            {signedTransaction}
          </p>
        </div>
      )}
    </div>
  );
}
