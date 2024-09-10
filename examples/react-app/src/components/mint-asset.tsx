import { bn } from 'fuels';
import { useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { NativeAssetContractAbi__factory } from '../types';
import { nativeAssetContract as TOKEN_CONTRACT_ID } from '../types/contract-ids.json';
import type { CustomError } from '../utils/customError';
import { DEFAULT_AMOUNT } from './balance';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const BAKO_TOKEN_SUB_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const UNKNOWN_TOKEN_SUB_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export default function MinterCounter({ isSigning, setIsSigning }: Props) {
  const { balance, wallet } = useWallet();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);

  const hasBalance = balance?.gte(DEFAULT_AMOUNT);

  useLogEvents();

  async function increment(subId: string) {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      try {
        const contract = await NativeAssetContractAbi__factory.connect(
          TOKEN_CONTRACT_ID,
          wallet,
        );

        const { waitForResult } = await contract.functions
          .mint({ Address: { bits: wallet.address.toB256() } }, subId, bn(1))
          .call();

        if (waitForResult) {
          async function checkResult() {
            const tx = await waitForResult();

            setToast({
              open: true,
              type: 'success',
              children: (
                <p>
                  Counter incremented! View it on the{' '}
                  <a
                    href={`https://app.fuel.network/tx/${tx.transactionId}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    block explorer
                  </a>
                </p>
              ),
            });
          }

          checkResult();
        }
        setToast({
          open: true,
          type: 'success',
          children: 'Minted Token',
        });
      } catch (err) {
        const error = err as CustomError;
        console.log('error', error);

        console.error('error sending transaction...', error.message);
        setToast({
          open: true,
          type: 'error',
          children: `The minting progress gone wrong: ${error.message.substring(
            0,
            32,
          )}...`,
        });
      } finally {
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  return (
    <div>
      <Feature title="Mint Token">
        <div className="space-x-2 my-4">
          <Button
            onClick={() => increment(BAKO_TOKEN_SUB_ID)}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Minting..."
          >
            Mint Bako Token
          </Button>
          <Button
            onClick={() => increment(UNKNOWN_TOKEN_SUB_ID)}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Minting..."
          >
            Mint Unknown Token
          </Button>
          <Notification
            setOpen={() => setToast({ ...toast, open: false })}
            {...toast}
          />
        </div>
      </Feature>
      <ContractLink />
    </div>
  );
}
