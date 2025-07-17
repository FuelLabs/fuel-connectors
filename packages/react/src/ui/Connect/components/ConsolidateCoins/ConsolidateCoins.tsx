import { Close } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  type ConsolidateCoinsEvent,
  type ScriptTransactionRequest,
  type SubmitAllCallback,
  consolidateCoins,
} from 'fuels';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChain, useWallet } from '../../../../hooks';
import { CloseIcon } from '../../../../icons/CloseIcon';
import { Spinner } from '../../../../icons/Spinner';
import { useConnectUI } from '../../../../providers';
import { QUERY_KEYS } from '../../../../utils';
import { DialogHeader, DialogMain, DialogTitle, Divider } from '../../styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';
import { ConsolidateButtonPrimary, DialogContainer } from './styles';

type ConsolidationStatus =
  | { status: 'loading' }
  | { status: 'ready' }
  | {
      status: 'consolidating';
      step: number;
      assetId: string;
      request: ScriptTransactionRequest;
      transactionId: string;
    }
  | { status: 'finished' };

const useConsolidate = ({ assetId }: { assetId: string | undefined }) => {
  // Useful context
  const { chain } = useChain();
  const { wallet } = useWallet();
  const { baseAssetId, chainId } = useMemo(
    () => ({
      baseAssetId: chain?.consensusParameters.baseAssetId,
      chainId: chain?.consensusParameters.chainId.toNumber(),
    }),
    [chain],
  );

  // Internal state
  const [currentStatus, setCurrentStatus] = useState<ConsolidationStatus>({
    status: 'loading',
  });
  const [submitAll, setSubmitAll] = useState<SubmitAllCallback>(() =>
    Promise.resolve({ txResponses: [], errors: [] }),
  );
  const [maxStep, setMaxStep] = useState<number>(0);

  // Functions
  const start = async () => {
    if (currentStatus.status !== 'ready' || !wallet) {
      return;
    }

    await submitAll({
      onTransactionStart: ({ tx, step, transactionId, assetId }) => {
        setCurrentStatus({
          status: 'consolidating',
          step,
          assetId,
          request: tx,
          transactionId,
        });
      },
    });

    setCurrentStatus({ status: 'finished' });
  };

  // Load our bundles
  useEffect(() => {
    // Wait till everything loads
    if (!wallet || !assetId || !baseAssetId || chainId === undefined) {
      return;
    }

    consolidateCoins({ account: wallet, assetId }).then(
      ({ submitAll, txs }) => {
        setCurrentStatus({ status: 'ready' });
        setSubmitAll(() => submitAll);
        setMaxStep(txs.length);
      },
    );
  }, [wallet, assetId, baseAssetId, chainId]);

  return {
    currentStatus,
    maxStep,
    start,
  };
};

export function ConsolidateCoins() {
  const { theme, cancel } = useConnectUI();
  const { data: consolidation } = useQuery<ConsolidateCoinsEvent['data']>({
    queryKey: QUERY_KEYS.consolidation(),
  });
  const { currentStatus, maxStep, start } = useConsolidate({
    assetId: consolidation?.assetId,
  });

  const Title = useCallback(
    ({ children }: { children: string }) => {
      const currentStep: number | null =
        currentStatus.status === 'consolidating' ? currentStatus.step : null;

      return (
        <DialogTitle>
          {children}
          {currentStep && (
            <>
              {' '}
              | {currentStep}/{maxStep}
            </>
          )}
        </DialogTitle>
      );
    },
    [currentStatus, maxStep],
  );

  const truncate = (input: string) => {
    return `${input.slice(0, 6)}....${input.slice(-4)}`;
  };

  const DialogButton = useCallback(() => {
    switch (currentStatus.status) {
      case 'finished':
        return (
          <ConsolidateButtonPrimary onClick={() => cancel()}>
            Close
          </ConsolidateButtonPrimary>
        );

      case 'loading':
      case 'consolidating':
        return (
          <ConsolidateButtonPrimary>
            <Spinner color="white" size={26} />
          </ConsolidateButtonPrimary>
        );

      case 'ready':
        return (
          <ConsolidateButtonPrimary onClick={start}>
            Start
          </ConsolidateButtonPrimary>
        );
    }
  }, [currentStatus, start, cancel]);

  return (
    <DialogFuel open={true} theme={theme} onOpenChange={() => cancel()}>
      <DialogContent data-connector={true}>
        <DialogHeader>
          <Title>Consolidate coins</Title>
          <Close asChild>
            <CloseIcon size={26} onClick={() => cancel()} />
          </Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          <DialogContainer>
            {currentStatus.status !== 'finished' && (
              <>
                <p>
                  You have reached the maximum number of UTXO's for a
                  transaction and therefore you must consolidate these coins
                  before continuing.
                </p>
              </>
            )}

            {currentStatus.status === 'consolidating' && (
              <>
                <Divider />

                <p>
                  Please sign the request for the following transaction.
                  <ul>
                    <li>
                      Transaction ID: {truncate(currentStatus.transactionId)}
                    </li>
                    <li>Asset ID: {truncate(currentStatus.assetId)}</li>
                  </ul>
                </p>
              </>
            )}

            {currentStatus.status === 'finished' && (
              <p>
                Successfully consolidated all coins, you can now proceed with
                your previous operation.
              </p>
            )}

            <Divider />

            <DialogButton />
          </DialogContainer>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
