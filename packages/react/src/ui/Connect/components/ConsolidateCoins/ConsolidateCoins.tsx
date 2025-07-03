import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  useChain,
  useCoins,
  useCurrentConnector,
  useWallet,
} from '../../../../hooks';
import { Spinner } from '../../../../icons/Spinner';
import { DialogHeader, DialogMain, DialogTitle, Divider } from '../../styles';
import { Button, ButtonLoading } from '../Network/styles';

const ButtonLoader = ({
  loading,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { loading: boolean }) => {
  const text = useMemo(() => {
    if (loading) {
      return (
        <span style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner color="white" size={32} />
        </span>
      );
    }

    return children;
  }, [loading, children]);

  return <Button {...props}>{text}</Button>;
};

export function ConsolidateCoins() {
  const { wallet } = useWallet();
  const { chain } = useChain();
  const [loading, setLoading] = useState(false);

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
      // TODO: Should probably show a status update?
      // .then()
      // TODO: display error?
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wallet, coins]);

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

        <ButtonLoader loading={loading} onClick={startConsolidation}>
          Start consolidation
        </ButtonLoader>
      </DialogMain>
    </>
  );
}
