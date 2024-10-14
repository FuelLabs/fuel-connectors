'use client';

import { hasSignMessageCustomCurve } from '@fuels/connectors';
import {
  useAccounts,
  useConnectUI,
  useCurrentConnector,
  useDisconnect,
  useIsConnected,
  useWallet,
} from '@fuels/react';
import { useState } from 'react';

export default function PageContent() {
  const [signature, setSignature] = useState('');
  const { connect, error, isError, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { accounts } = useAccounts();
  const { wallet } = useWallet();
  const { currentConnector } = useCurrentConnector();

  async function signMessage() {
    const message = 'Hello World!';

    if (hasSignMessageCustomCurve(currentConnector)) {
      const { curve, signature } =
        await currentConnector.signMessageCustomCurve(message);

      setSignature(`${curve} signature - ${signature}`);
    } else if (wallet) {
      const signature = await wallet.signMessage(message);
      setSignature(`Native signature - ${signature}`);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          console.log('connect');
          connect();
        }}
      >
        {isConnecting ? 'Connecting' : 'Connect'}
      </button>
      {isConnected && (
        <button
          type="button"
          onClick={() => {
            disconnect();
            setSignature('');
          }}
        >
          Disconnect
        </button>
      )}

      {isConnected && (
        <button type="button" onClick={() => signMessage()}>
          Sign Message
        </button>
      )}

      {isError && <p className="Error">{error?.message}</p>}

      {wallet && <div>Wallet: {wallet.address.toString()}</div>}

      {isConnected && (
        <>
          <div>
            <h3>Connected accounts</h3>
            {accounts?.map((account) => (
              <div key={account}>
                <b>Account:</b> {account}
              </div>
            ))}
          </div>
          {signature && (
            <div>
              <h3>Signature</h3>
              <p>{signature}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
