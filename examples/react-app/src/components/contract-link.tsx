import { COUNTER_CONTRACT_ID } from '../config';

export default function ContractLink() {
  return (
    <a
      href={`https://app.fuel.network/contract/${COUNTER_CONTRACT_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-end text-sm text-zinc-300/70"
    >
      See Contract
    </a>
  );
}
