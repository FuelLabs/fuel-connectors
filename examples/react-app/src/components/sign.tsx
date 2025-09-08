import type { HashableMessage } from 'fuels';
import { arrayify, hexlify } from 'fuels';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { CustomError } from '../utils/customError';

import { Copyable } from './Copyable';
import Button from './button';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

const DEFAULT_MESSAGE = `Fuelum ipsum FuelVM sit amet, high-performance Ethereum layer-2 consectetur adipiscing elit. Home verification dolor magna aliqua, scalability ut labore et dolore Sway nulla pariatur. Modular blockchain quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Fuel Network tempor incididunt, powered by FuelVM ut labore et dolore magna aliqua. Ut enim ad minim veniam, scalable for all quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

const DEFAULT_OBJECT = {
  personalSign: hexlify(
    new TextEncoder().encode(
      JSON.stringify({
        type: 'auth',
        timestamp: Date.now(),
        data: {
          action: 'login',
          nonce: Math.random().toString(36).substring(7),
        },
      }),
    ),
  ),
};

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

  const handleSign = async (message: HashableMessage) => {
    setLoading(true);
    setIsSigning(true);
    try {
      console.log('Signing message:', message);
      const resp = await wallet?.signMessage(message);
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
      console.error('Sign error:', error);

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
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 justify-between">
          <input
            type="text"
            placeholder="Message to sign"
            value={messageToSign}
            onChange={(e) => setMessageToSign(e.target.value)}
            className="w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 font-mono md:-ml-2 md:mt-2 md:p-2 dark:bg-transparent"
          />
          <Button
            onClick={() => handleSign(messageToSign)}
            disabled={isLoading || isSigning}
            className="shrink-0 w-1/3"
            loading={isLoading}
            loadingText="Signing..."
          >
            Sign Message
          </Button>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 font-mono md:-ml-2 md:p-2 dark:bg-transparent">
            <pre className="text-xs">
              {JSON.stringify(
                JSON.parse(
                  new TextDecoder().decode(
                    arrayify(DEFAULT_OBJECT.personalSign),
                  ),
                ),
                null,
                2,
              )}
            </pre>
          </div>
          <Button
            onClick={() => handleSign(DEFAULT_OBJECT)}
            disabled={isLoading || isSigning}
            className="shrink-0 w-1/3"
            loading={isLoading}
            loadingText="Signing..."
          >
            Sign Object
          </Button>
        </div>

        {/* Test single byte array edge case */}
        <div className="flex items-center gap-2 justify-between">
          <div className="w-2/3 shrink basis-2/3 rounded-lg border border-zinc-500/25 font-mono md:-ml-2 md:p-2 dark:bg-transparent">
            <pre>Single Byte: [0]</pre>
          </div>
          <Button
            onClick={() => {
              console.log('Testing single byte array');
              handleSign({ personalSign: new Uint8Array([0]) });
            }}
            disabled={isLoading || isSigning}
            className="shrink-0 w-1/3"
            loading={isLoading}
            loadingText="Signing..."
          >
            Sign Byte
          </Button>
        </div>
      </div>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </Feature>
  );
}
