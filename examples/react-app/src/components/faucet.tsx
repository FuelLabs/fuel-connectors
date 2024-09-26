export interface FaucetProps {
  address: string;
  isSigning: boolean;
  disabled?: boolean;
}
export function Faucet({ address, isSigning, disabled }: FaucetProps) {
  const url = `https://faucet-testnet.fuel.network/?address=${address}&autoClose&redirectUrl=${window.location.href}`;

  return (
    <a
      href={disabled ? undefined : url}
      className={`btn ${
        isSigning || disabled
          ? 'cursor-not-allowed border border-zinc-400/25 bg-zinc-950 text-zinc-400'
          : 'btn-primary'
      }`}
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
