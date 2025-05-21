import { useCurrentConnector } from '@fuels/react';
import type { TransactionRequestLike } from 'fuels';
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
        console.log('Signing increment transaction...');

        // Create contract instance
        const contract = new Counter(counterContractId, wallet);

        // Create transaction request with gas limit
        const tx = await contract.functions
          .increment_counter()
          .txParams({ gasLimit: 100_000 })
          .getTransactionRequest();

        if (!tx) {
          throw Error('Failed to create increment counter transaction request');
        }

        console.log(
          'Created transaction request, attempting to prepare for funding...',
        );
        let gasPriceForFundingLog: string | undefined;
        try {
          const txCost = await wallet.getTransactionCost(tx, {
            estimateTxDependencies: true,
          });
          gasPriceForFundingLog = txCost.gasPrice?.toString();

          console.log('Transaction cost calculated:', {
            minFee: txCost.minFee?.toString(),
            maxFee: txCost.maxFee?.toString(),
            gasPrice: gasPriceForFundingLog,
            requiredQuantities: txCost.requiredQuantities.map((rq) => ({
              assetId: rq.assetId,
              amount: rq.amount.toString(),
            })),
          });

          await wallet.fund(tx, txCost);

          console.log('Transaction request after funding:', {
            type: tx?.type,
            inputs: tx?.inputs?.length,
            outputs: tx?.outputs?.length,
            witnesses: tx?.witnesses?.length,
            gasPriceUsedForFunding: gasPriceForFundingLog,
          });
        } catch (fundError) {
          console.error(
            'Error preparing/funding transaction for signing:',
            fundError,
          );
          setToast({
            open: true,
            type: 'error',
            children: `Failed to prepare transaction for signing: ${
              (fundError as Error).message
            }`,
          });
          setLoading(false);
          setIsSigning(false);
          return; // Stop if funding fails
        }

        // Sign the transaction without broadcasting it
        const signedTransaction = await currentConnector.signTransaction(
          wallet.address.toString(),
          tx,
        );

        console.log('Received signed transaction:', !!signedTransaction);

        setToast({
          open: true,
          type: 'success',
          children: (
            <div>
              <div>Transaction signed successfully!</div>
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
        console.error('Error signing increment transaction:', error);
        setToast({
          open: true,
          type: 'error',
          children: `Failed to sign transaction: ${(error as Error).message}`,
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
