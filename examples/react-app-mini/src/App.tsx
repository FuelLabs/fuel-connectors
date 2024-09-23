import { useConnectUI, useDisconnect } from '@fuels/react';
import { useAccount } from '@fuels/react';

export default function App() {
  const { connect } = useConnectUI();
  const { account } = useAccount();
  const { disconnect } = useDisconnect();

  console.log('asd account', account);

  return (
    <div>
      <h1>Fuel Connectors MINI</h1>
      {account ? (
        <>
          <p>Account: {account}</p>
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <button type="button" onClick={connect}>
          Connect
        </button>
      )}
    </div>
  );
}
