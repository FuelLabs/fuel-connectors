import { Close } from '@radix-ui/react-dialog';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useChain, useCoins, useWallet } from '../../../../hooks';
import { CloseIcon } from '../../../../icons/CloseIcon';
import { Spinner } from '../../../../icons/Spinner';
import { useConnectUI } from '../../../../providers';
import { DialogHeader, DialogMain, DialogTitle, Divider } from '../../styles';
import { ConnectorButtonPrimary } from '../Connector/styles';
import { DialogContent } from '../Core/DialogContent';
import { DialogFuel } from '../Core/DialogFuel';
import { Button, ButtonLoading } from '../Network/styles';

const _ButtonLoader = ({
  loading,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { loading: boolean }) => {
  if (loading) {
    return (
      <ButtonLoading>
        <Spinner size={26} color="var(--fuel-loader-background)" />
      </ButtonLoading>
    );
  }

  return <Button {...props} />;
};

export function ConsolidateCoins() {
  const { theme, cancel } = useConnectUI();
  const { wallet } = useWallet();
  const { chain } = useChain();
  const [_loading, setLoading] = useState(false);
  const [consolidated, setConsolidated] = useState(false);

  const { maxInputs, assetId, assetNamePlural } = useMemo(() => {
    const maxInputs =
      chain?.consensusParameters.txParameters.maxInputs.toNumber();
    const baseAssetId = chain?.consensusParameters.baseAssetId;

    // TODO: determine the asset ID from error
    const assetId = baseAssetId;

    const isBaseAsset = assetId === baseAssetId;
    const assetNamePlural = isBaseAsset ? 'base assets' : 'non-base assets';

    return { maxInputs, assetId, assetNamePlural };
  }, [chain]);

  const { coins } = useCoins({
    account: wallet?.address.toB256(),
    assetId,
    query: {
      refetchInterval: 1000,
      refetchOnWindowFocus: true,
    },
  });

  const handleConsolidation = useCallback(async () => {
    if (!wallet) {
      return;
    }

    setLoading(true);

    wallet
      .assembleBaseAssetConsolidationTxs({ coins, mode: 'sequential' })
      .then(({ submitAll }) => submitAll())
      .then(() => setConsolidated(true))

      // TODO: display some error?
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wallet, coins]);

  return (
    <DialogFuel open={true} theme={theme} onOpenChange={() => cancel()}>
      <DialogContent data-connector={true}>
        <DialogHeader>
          <DialogTitle>Consolidate Coins</DialogTitle>
          <Close asChild>
            <CloseIcon size={26} onClick={() => cancel()} />
          </Close>
        </DialogHeader>
        <Divider />
        <DialogMain>
          {!consolidated && (
            <>
              <div>
                You current have {coins.length} UTXOs for {assetNamePlural}. The
                maximum number of {assetNamePlural} you can transact without
                consolidating is {maxInputs}.
              </div>

              <div>
                We need to execute a consolidation process of your UTXOs, so
                your account can become usable again.
              </div>

              <ConnectorButtonPrimary onClick={handleConsolidation}>
                Confirm Selection
              </ConnectorButtonPrimary>
            </>
          )}

          {consolidated && (
            <>
              <div>
                Successfully consolidated UTXOs, you can now continue your
                previous operation.
              </div>

              <ConnectorButtonPrimary onClick={() => cancel()}>
                Close
              </ConnectorButtonPrimary>
            </>
          )}
        </DialogMain>
      </DialogContent>
    </DialogFuel>
  );
}
