import { counter as COUNTER_CONTRACT_ID } from '../types/contract-ids.json';

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
