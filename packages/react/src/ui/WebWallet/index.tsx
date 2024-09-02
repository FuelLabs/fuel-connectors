import { useEffect, useState } from 'react';
import { Profile } from './components/Profile';
import { Container, DashedSeparator, Header, Modal } from './styles';

export function WebWallet() {
  const [_isClient, setIsClient] = useState(false);
  const [username] = useState('Nick D');

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Container>
      <Modal>
        <Header>
          {/* o que a imagem tem que mostrar? */}
          <Profile name={username} />
        </Header>
        <div>
          <h1>Total Balance</h1>
          <h2>0.00000000 BTC</h2>
        </div>
        <DashedSeparator />
        <div>
          <h1>Assets</h1>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bitcoin</td>
                <td>0.00000000 BTC</td>
              </tr>
              <tr>
                <td>Ethereum</td>
                <td>0.00000000 BTC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </Container>
  );
}
