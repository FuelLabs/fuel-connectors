import { Close } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  type Account,
  type Coin,
  type ConsolidateCoinsEvent,
  type CursorPaginationArgs,
  type GetCoinsResponse,
  type ScriptTransactionRequest,
  sleep,
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

type ConsolidationBundle = {
  assetId: string;
  request: ScriptTransactionRequest;
  transactionId: string;
};

type ConsolidationStatus =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'consolidating'; step: number; bundle: ConsolidationBundle }
  | { status: 'finished' };

const getAllCoins = async (
  getCoins: (pagination: CursorPaginationArgs) => Promise<GetCoinsResponse>,
) => {
  const allCoins: Coin[] = [];
  const pagination: Partial<CursorPaginationArgs> = {};

  while (true) {
    const { coins, pageInfo } = await getCoins(pagination);
    allCoins.push(...coins);

    if (!pageInfo.hasNextPage) {
      break;
    }

    pagination.after = pageInfo.endCursor;
  }

  return { coins: allCoins };
};

const createBundles = async ({
  chainId,
  wallet,
  assetId,
  baseAssetId,
}: {
  chainId: number;
  wallet: Account;
  assetId: string;
  baseAssetId: string;
}) => {
  const { coins } = await getAllCoins((pagination) =>
    wallet.getCoins(assetId, pagination),
  );
  const consolidations =
    assetId === baseAssetId
      ? await wallet.assembleBaseAssetConsolidationTxs({ coins })
      : await wallet.assembleNonBaseAssetConsolidationTxs({ coins, assetId });

  return consolidations.txs.map(
    (request) =>
      ({
        transactionId: request.getTransactionId(chainId),
        request,
        assetId,
      }) as ConsolidationBundle,
  );
};

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
  const [bundles, setBundles] = useState<ConsolidationBundle[]>([]);
  const maxStep = useMemo(() => bundles.length, [bundles]);

  // Functions
  const start = async () => {
    if (currentStatus.status !== 'ready' || !wallet) {
      return;
    }

    for (let i = 0; i < bundles.length; i++) {
      const step = i + 1;
      const bundle = bundles[i];
      setCurrentStatus({ status: 'consolidating', step, bundle });

      try {
        // Re-assemble transaction
        const { assembledRequest } = await wallet.provider.assembleTx({
          request: bundle.request,
          feePayerAccount: wallet,
        });

        const { waitForResult } =
          await wallet.sendTransaction(assembledRequest);
        await waitForResult();
      } catch (e: unknown) {
        // TODO: show error to use
        console.error(e);
      }
    }

    setCurrentStatus({ status: 'finished' });
  };

  // Load our bundles
  useEffect(() => {
    // Wait till everything loads
    if (!wallet || !assetId || !baseAssetId || chainId === undefined) {
      return;
    }

    createBundles({ wallet, assetId, baseAssetId, chainId }).then((bundles) => {
      setCurrentStatus({ status: 'ready' });
      setBundles(bundles);
    });
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
      const currentStep =
        currentStatus.status !== 'consolidating' ? 0 : currentStatus.step;

      return (
        <DialogTitle>
          {children}
          {currentStatus.status !== 'loading' && (
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
            <p>
              You have reached the maximum number of UTXO's for a transaction
              and therefore you must consolidate these coins before continuing.
            </p>

            <Divider />

            {currentStatus.status === 'consolidating' && (
              <p>
                Please sign the request for the following transaction.
                <ul>
                  <li>
                    Transaction ID:{' '}
                    {truncate(currentStatus.bundle.transactionId)}
                  </li>
                  <li>Asset ID: {truncate(currentStatus.bundle.assetId)}</li>
                </ul>
              </p>
            )}

            {currentStatus.status === 'finished' && (
              <p>
                Successfully consolidated all coins, you can now proceed with
                your previous operation.
              </p>
            )}

            <DialogButton />
          </DialogContainer>
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
