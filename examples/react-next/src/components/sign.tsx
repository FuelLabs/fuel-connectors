import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';

import { Copyable } from './Copyable';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

const DEFAULT_MESSAGE = `Fuelum ipsum FuelVM sit amet, high-performance Ethereum layer-2 consectetur adipiscing elit. Home verification dolor magna aliqua, scalability ut labore et dolore Sway nulla pariatur. Modular blockchain quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Fuel Network tempor incididunt, powered by FuelVM ut labore et dolore magna aliqua. Ut enim ad minim veniam, scalable for all quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export default function Sign({ isSigning, setIsSigning }: Props) {
  const { wallet } = useWallet();

  const [messageToSign, setMessageToSign] = useState(DEFAULT_MESSAGE);
  const [signedMessage, setSignedMessage] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const handleSign = async () => {
    setLoading(true);
    setIsSigning(true);
    try {
      const resp = await wallet?.signMessage(messageToSign);
      setSignedMessage(resp || '');

      setToast({
        open: true,
        type: 'success',
        children: 'Message signed',
      });
      setLoading(false);
      setIsSigning(false);
    } catch (err) {
      const error = err as CustomError;
      console.error(error.message);

      setToast({
        open: true,
        type: 'error',
        children: error.message.substring(0, 32),
      });

      setLoading(false);
      setIsSigning(false);
    }
  };

  return (
    <Feature
      title="Sign"
      lastRow={
        signedMessage ? (
          <div>
            <h3 className="flex mt-3 mb-1 text-sm font-medium md:mb-0 dark:text-zinc-300/70">
              Signed Message
              <div className="ml-2">
                <Copyable value={signedMessage} />
              </div>
            </h3>
            <p className="whitespace-pre-wrap max-w-full break-words">
              {signedMessage}
            </p>
          </div>
        ) : null
      }
    >
      <input
        type="text"
        placeholder="Message to sign"
        value={messageToSign}
        onChange={(e) => setMessageToSign(e.target.value)}
        className="-ml-1 mr-2 mt-1 w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 p-1 font-mono outline-none md:-ml-2 md:mt-2 md:p-2 dark:bg-transparent"
      />
      <Button
        onClick={handleSign}
        disabled={isLoading || isSigning}
        className="mt-1 shrink-0 md:mt-2"
        loading={isLoading}
        loadingText="Signing..."
      >
        Sign Message
      </Button>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </Feature>
  );
}
