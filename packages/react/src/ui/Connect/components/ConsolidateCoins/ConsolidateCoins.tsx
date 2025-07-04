import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Routes } from 'src/providers/FuelUIProvider';
import {
  useChain,
  useCoins,
  useCurrentConnector,
  useWallet,
} from '../../../../hooks';
import { Spinner } from '../../../../icons/Spinner';
import { useConnectUI } from '../../../../providers';
import { DialogHeader, DialogMain, DialogTitle, Divider } from '../../styles';
import { Button, ButtonLoading } from '../Network/styles';

const ButtonLoader = ({
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
  const { cancel } = useConnectUI();
  const { wallet } = useWallet();
  const { chain } = useChain();
  const [loading, setLoading] = useState(false);
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

  const startConsolidation = useCallback(async () => {
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

  if (consolidated) {
    return (
      <>
        <DialogMain>
          <p>
            The consolidation process has been completed, you can continue to
            proceed with your previous transaction.
          </p>

          <Divider />

          <ButtonLoader
            type="button"
            value="Okay"
            loading={false}
            onClick={() => cancel()}
          />
        </DialogMain>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Your account needs UTXO consolidation</DialogTitle>
      </DialogHeader>

      <DialogMain>
        <p>
          You current have {coins.length} UTXOs for {assetNamePlural}. The
          maximum number of {assetNamePlural} you can transact without
          consolidating is {maxInputs}.
        </p>

        <p>
          We need to execute a consolidation process of your UTXOs, so your
          account can become usable again.
        </p>

        <Divider />

        <ButtonLoader
          type="button"
          value="Start consolidation"
          loading={loading}
          onClick={startConsolidation}
        />
      </DialogMain>
    </>
  );
}
