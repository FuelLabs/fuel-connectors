import { useEffect, useState } from 'react';
import { Balance } from './components/Balance';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { Separator } from './components/Separator';
import { Anchor } from './composites/Anchor';
import { Assets } from './composites/Assets';
import { Profile } from './composites/Profile';
import { Overlay } from './styles';

export function WebWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [username] = useState('Nick D');
  const [address] = useState('0x1234567890abcdef1234567890abcdef12345678');

  // Create animation for modal open
  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <Overlay>
      {isOpen && (
        <Modal>
          <Header>
            <Profile name={username} address={address} />
          </Header>
          <Balance />
          <Separator color="#ADADAD" type="dashed" />
          <Assets />
        </Modal>
      )}
      <Anchor address={address} onClick={toggleModal} />
    </Overlay>
  );
}
