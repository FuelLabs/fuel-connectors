import { COUNTER_CONTRACT_ID } from './counter';

export default function ContractLink() {
  return (
    <a
      href={`https://app.fuel.network/contract/${COUNTER_CONTRACT_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-end"
    >
      See Contract
    </a>
  );
}
