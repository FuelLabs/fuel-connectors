import { Close } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  type ConsolidateCoinsEvent,
  type SubmitAllCallback,
  consolidateCoins,
} from 'fuels';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '../../../../hooks';
import { CheckCircleIcon } from '../../../../icons/CheckCircleIcon';
import { CloseIcon } from '../../../../icons/CloseIcon';
import { ErrorIcon } from '../../../../icons/ErrorIcon';
import { Spinner } from '../../../../icons/Spinner';
import { useConnectUI } from '../../../../providers';
import { QUERY_KEYS } from '../../../../utils';
import { useVerifiedAssets } from '../../hooks/useVerifiedAssets';
import { DialogHeader, DialogMain, DialogTitle, Divider } from '../../styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';
import { ProgressBar } from './ProgressBar';
import { ConsolidateButtonPrimary, DialogContainer } from './styles';

export function ConsolidateCoins() {
  const { wallet } = useWallet();
  const { theme, cancel } = useConnectUI();
  const { data: consolidation } = useQuery<ConsolidateCoinsEvent['data']>({
    queryKey: QUERY_KEYS.consolidation(),
  });

  // Load the asset name and symbol
  const { verifiedAssets } = useVerifiedAssets();
  const asset = useMemo(() => {
    if (!consolidation?.assetId || !verifiedAssets) {
      return null;
    }

    const asset = verifiedAssets.find(
      (asset) => asset.assetId === consolidation?.assetId,
    );
    if (!asset) {
      return null;
    }

    return {
      symbol: asset?.symbol,
      name: asset?.name,
    };
  }, [consolidation?.assetId, verifiedAssets]);

  // Internal state
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'consolidating' | 'finished' | 'error'
  >('loading');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number | undefined>(undefined);
  const [utxoCount, setUtxoCount] = useState<number>(0);
  const [submitAll, setSubmitAll] = useState<SubmitAllCallback>(() =>
    Promise.resolve({ txResponses: [], errors: [] }),
  );

  // Functions
  const setupConsolidation = async () => {
    if (!wallet || !consolidation?.assetId) {
      return;
    }

    setStatus('loading');

    consolidateCoins({ account: wallet, assetId: consolidation?.assetId })
      .then(({ submitAll, txs }) => {
        setStatus('ready');
        setSubmitAll(() => submitAll);
        setCurrentStep(0);
        setTotalSteps(txs.length);
        const utxoCount = txs.reduce((acc, tx) => acc + tx.inputs.length, 0);
        setUtxoCount(utxoCount);
      })
      .catch((error) => {
        console.error('Error consolidating coins', error);
        setStatus('error');
      });
  };

  const start = async () => {
    if (status !== 'ready' || !wallet || !consolidation?.assetId) {
      return;
    }

    await submitAll({
      onTransactionStart: ({ step }) => {
        setStatus('consolidating');
        setCurrentStep(step);
      },
    })
      .then(() => {
        setStatus('finished');
      })
      .catch((error) => {
        console.error('Error consolidating coins', error);
        setStatus('error');
      });
  };

  const retry = async () => {
    await setupConsolidation();
  };

  // Load our bundles
  useEffect(() => {
    // Wait till everything loads
    if (!wallet || !consolidation?.assetId) {
      return;
    }

    setupConsolidation();
  }, [wallet, consolidation?.assetId, setupConsolidation]);

  const SubmitButton = useCallback(() => {
    if (status === 'error') {
      return (
        <ConsolidateButtonPrimary onClick={() => retry()}>
          Retry
        </ConsolidateButtonPrimary>
      );
    }

    if (status === 'finished') {
      return (
        <ConsolidateButtonPrimary onClick={() => cancel()}>
          Close
        </ConsolidateButtonPrimary>
      );
    }

    return (
      <ConsolidateButtonPrimary
        onClick={() => start()}
        isLoading={status === 'consolidating' || status === 'loading'}
      >
        Start
      </ConsolidateButtonPrimary>
    );
  }, [status, retry, cancel, start]);

  return (
    <DialogFuel theme={theme} open={true} onOpenChange={() => cancel()}>
      <DialogContent data-connector={true}>
        <DialogHeader>
          <DialogTitle>Consolidate coins</DialogTitle>
          <Close asChild>
            <CloseIcon size={26} onClick={() => cancel()} />
          </Close>
        </DialogHeader>

        <Divider />

        <DialogMain>
          <DialogContainer>
            {status === 'loading' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '1rem',
                }}
              >
                <Spinner size={48} color="#e5e7eb" />
              </div>
            )}

            {(status === 'ready' || status === 'consolidating') && (
              <>
                <div className="text-sm text-gray-600">
                  Consolidating {utxoCount} UTXOs
                  {asset
                    ? ` for the asset ${asset.name} (${asset.symbol})`
                    : ''}
                  .
                </div>

                <br />

                <ProgressBar
                  theme={theme}
                  current={currentStep}
                  total={totalSteps}
                />
              </>
            )}

            {status === 'finished' && (
              <>
                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                  <p>
                    Consolidation finished! You can now close this window and
                    continue your previous operation.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1rem',
                  }}
                >
                  <CheckCircleIcon size={48} color="#22c55e" />
                </div>
              </>
            )}

            {status === 'error' && (
              <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '1rem',
                  }}
                >
                  <ErrorIcon size={100} theme={theme} />
                  <p>Error consolidating coins</p>
                  <p>Please try again</p>
                </div>
              </div>
            )}

            <Divider />

            <SubmitButton />
          </DialogContainer>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
