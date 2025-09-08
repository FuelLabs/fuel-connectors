import { useConfig } from '../context/ConfigContext';

export default function ContractLink() {
  const { counterContractId, explorerUrl } = useConfig();

  return (
    <a
      href={`${explorerUrl}/contract/${counterContractId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-end text-sm text-zinc-300/70"
    >
      See Contract
    </a>
  );
}
