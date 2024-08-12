import { useRef, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { Modal } from './modal';

export interface FaucetProps {
  address: string;
  isSigning: boolean;
}
export function Faucet({ address, isSigning }: FaucetProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const faucetIframe = useRef<HTMLIFrameElement>(null);

  const url = `https://faucet-testnet.fuel.network/?address=${address}&autoClose`;
  const propsMobile = isMobile && {
    href: `${url}&redirectUrl=${window.location.href}`,
    target: '_blank',
  };

  return (
    <>
      {!isMobile && (
        <Modal open={open}>
          <iframe
            ref={faucetIframe}
            src={open ? url : undefined}
            title="Faucet"
            onLoad={() => {
              faucetIframe.current?.focus();
            }}
            onBlur={() => setOpen(false)}
            style={{ width: '100%', height: '100%' }}
          />
        </Modal>
      )}
      <a
        {...propsMobile}
        className={`btn ${
          isSigning
            ? 'cursor-not-allowed border border-zinc-400/25 bg-zinc-950 text-zinc-400'
            : 'btn-primary'
        }`}
        rel="noreferrer"
        // biome-ignore lint: use button instead of a
        onClick={(e) => {
          if (isSigning || !isMobile) {
            e.preventDefault();
          }
          if (!isMobile) {
            setOpen(true);
          }
        }}
      >
        Get coins
      </a>
    </>
  );
}
