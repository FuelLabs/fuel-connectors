import { useConnectUI, useDisconnect, useIsConnected } from '@fuels/react';

function App() {
  const { connect, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();

  if (isConnected) {
    return (
      <button type="button" onClick={() => disconnect()}>
        Disconnect
      </button>
    );
  }

  return (
    <button type="button" onClick={connect}>
      {isConnecting ? 'Connecting' : 'Connect'}
    </button>
  );
}

export default App;
