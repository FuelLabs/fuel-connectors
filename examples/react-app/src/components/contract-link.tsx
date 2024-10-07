import { COUNTER_CONTRACT_ID, EXPLORER_URL } from '../config';

export default function ContractLink() {
  return (
    <a
      href={`${EXPLORER_URL}/contract/${COUNTER_CONTRACT_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-end text-sm text-zinc-300/70"
    >
      See Contract
    </a>
  );
}
