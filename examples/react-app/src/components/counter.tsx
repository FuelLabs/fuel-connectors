import { useSignTransaction } from '@fuels/react';
import type { ScriptTransactionRequest, TransactionRequest } from 'fuels';
import { Provider } from 'fuels';
import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { Counter } from '../types';

import type { CustomError } from '../utils/customError';

import { useConfig } from '../context/ConfigContext';
import { Copyable } from './Copyable';
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
  const { signTransactionAsync } = useSignTransaction();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [signedTransaction, setSignedTransaction] = useState<string | null>(
    null,
  );

  const hasBalance = balance?.gte(defaultAmount);

  useLogEvents();

  useEffect(() => {
    if (wallet) {
      getCount();
    }
  }, [wallet]);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <Feature title="Counter Contract">
        <code>{counter}</code>
        <div className="space-x-2 inline-flex items-center">
          <Button
            onClick={increment}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Submitting..."
          >
            Submit Increment
          </Button>
          <div className="relative inline-block">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="shrink-0"
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
                      handleSignIncrement();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                  >
                    Sign Increment
                  </button>
                </div>
              </div>
            )}
          </div>
          <Notification
            setOpen={() => setToast({ ...toast, open: false })}
            {...toast}
          />
        </div>
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
      <ContractLink />
    </div>
  );

  async function increment() {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      const contract = new Counter(counterContractId, wallet);
      try {
        const { waitForResult } = await contract.functions
          .increment_counter()
          .call();

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

  async function handleSignIncrement() {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      try {
        const contract = new Counter(counterContractId, wallet);

        const txRequest = await contract.functions
          .increment_counter()
          .txParams({ gasLimit: 100_000 })
          .getTransactionRequest();

        if (!txRequest) {
          throw Error('Failed to create increment counter transaction request');
        }

        if (!wallet.provider?.url) {
          throw new Error(
            'Provider URL not found to create a local provider for assembleTx',
          );
        }
        const localProvider = new Provider(wallet.provider.url);
        await localProvider.init();

        const { assembledRequest } =
          await localProvider.assembleTx<ScriptTransactionRequest>({
            request: txRequest,
            feePayerAccount: wallet,
            accountCoinQuantities: [],
          });

        if (!assembledRequest) {
          throw new Error(
            'Failed to destructure .assembledRequest from localProvider.assembleTx response. The method might not exist or returns a different structure. Check runtime error or logs.',
          );
        }

        const txRequestSigned = await signTransactionAsync({
          address: wallet.address.toString(),
          transaction: assembledRequest,
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
        console.error(
          'Error signing increment transaction (with assembleTx):',
          error,
        );
        setToast({
          open: true,
          type: 'error',
          children: `Failed to sign transaction (assembleTx): ${
            (error as Error).message
          }`,
        });
      } finally {
        setLoading(false);
        setIsSigning(false);
      }
    } else {
      console.error('Wallet not available');
    }
  }
}
