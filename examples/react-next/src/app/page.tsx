'use client';

import {
  useAccounts,
  useConnectUI,
  useDisconnect,
  useIsConnected,
  useWallet,
} from '@fuels/react';

export default function Page() {
  const { connect, error, isError, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { accounts } = useAccounts();

  const { wallet } = useWallet();

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
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}

      {isError && <p className="Error">{error?.message}</p>}

      {wallet && <div>Wallet: {wallet.address.toString()}</div>}

      {isConnected && (
        <div>
          <h3>Connected accounts</h3>
          {accounts?.map((account) => (
            <div key={account}>
              <b>Account:</b> {account}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
