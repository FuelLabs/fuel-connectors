import { useCurrentConnector } from '@fuels/react';
import type { ScriptTransactionRequest } from 'fuels';
import { Provider } from 'fuels';
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
  const { currentConnector } = useCurrentConnector();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                    Sign Only
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
    if (wallet && currentConnector && 'signTransaction' in currentConnector) {
      setLoading(true);
      setIsSigning(true);
      try {
        console.log('Signing increment transaction using assembleTx...');

        const contract = new Counter(counterContractId, wallet);

        const txRequest = await contract.functions
          .increment_counter()
          .txParams({ gasLimit: 100_000 })
          .getTransactionRequest();

        if (!txRequest) {
          throw Error('Failed to create increment counter transaction request');
        }

        console.log('Transaction request created, attempting to assemble...');

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
        console.log(
          'Result of localProvider.assembleTx (expecting { assembledRequest: ... }): ',
          assembledRequest
            ? 'Request extracted'
            : 'Request NOT extracted or assembleTx failed',
        );

        if (!assembledRequest) {
          throw new Error(
            'Failed to destructure .assembledRequest from localProvider.assembleTx response. The method might not exist or returns a different structure. Check runtime error or logs.',
          );
        }

        console.log(
          'Transaction assembled (from destructured .assembledRequest):',
          {
            inputs: assembledRequest.inputs?.length,
            outputs: assembledRequest.outputs?.length,
            witnesses: assembledRequest.witnesses?.length,
          },
        );

        const signedTransaction = await currentConnector.signTransaction(
          wallet.address.toString(),
          assembledRequest,
        );

        console.log('Received signed transaction:', !!signedTransaction);

        setToast({
          open: true,
          type: 'success',
          children: (
            <div>
              <div>Transaction signed successfully! (Using assembleTx)</div>
              <div className="text-xs mt-1">
                The transaction was not broadcast to the network.
              </div>
              <div className="break-all text-xs mt-1 font-mono">
                {signedTransaction
                  ? `${signedTransaction.substring(0, 80)}...`
                  : 'No signature returned'}
              </div>
            </div>
          ),
        });
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
      console.error(
        'Wallet or connector not available, or signTransaction not supported',
      );
    }
  }
}
