export interface FaucetProps {
  address: string;
  isSigning: boolean;
  disabled?: boolean;
}
export function Faucet({ address, isSigning, disabled }: FaucetProps) {
  const isLocal = /localhost/.test(window.location.href);
  const faucetUrl = isLocal ? 'localhost:4040' : 'faucet-testnet.fuel.network';
  const url = `http://${faucetUrl}/?address=${address}&autoClose&redirectUrl=${window.location.href}`;

  return (
    <a
      href={disabled ? undefined : url}
      className={`btn ${
        isSigning || disabled
          ? 'cursor-not-allowed border border-zinc-400/25 bg-zinc-950 text-zinc-400'
          : 'btn-primary'
      }`}
      aria-disabled={disabled}
      rel="noreferrer"
      onClick={(e) => {
        if (isSigning) {
          e.preventDefault();
        }
      }}
    >
      Get coins
    </a>
  );
}
