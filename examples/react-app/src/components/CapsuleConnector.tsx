import { CapsuleModal } from '@usecapsule/react-sdk';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useDisconnect,
  useConnect as useWagmiConnect,
} from 'wagmi';
import { capsuleClient } from './CapsuleClient';
import Button from './button';

export function CapsuleConnector() {
  const { connect, connectors } = useWagmiConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    console.log('connectors', connectors);
  }, [connectors]);

  if (isConnected) {
    return (
      <div>
        <p>Connected as {address}</p>
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </div>
    );
  }

  return (
    <>
      <div>
        {connectors
          .filter((connector) => connector.id === 'capsule')
          .map((connector) => (
            <Button key={connector.id} onClick={() => connect({ connector })}>
              Connect with {connector.name}
            </Button>
          ))}
      </div>
    </>
  );
}
