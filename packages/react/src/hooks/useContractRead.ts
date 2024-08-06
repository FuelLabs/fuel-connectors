import { type Address, Contract, type JsonAbi, type Provider } from 'fuels';
import type { FunctionNames, InputsForFunctionName } from '../types';

import { useNamedQuery } from '../core/useNamedQuery';
import { QUERY_KEYS } from '../utils';

type ContractData<TAbi extends JsonAbi> = {
  address: Address;
  abi: TAbi;
  provider: Provider;
};

type ContractReadProps<
  TAbi extends JsonAbi,
  TFunctionName extends FunctionNames<TAbi>,
> = {
  contract: Contract | ContractData<TAbi>;
  functionName: TFunctionName;
  args: InputsForFunctionName<TAbi, TFunctionName>;
};

export const useContractRead = <
  TAbi extends JsonAbi,
  TFunctionName extends FunctionNames<TAbi>,
>({
  functionName,
  args,
  contract: _contract,
}: ContractReadProps<TAbi, TFunctionName>) => {
  const isContractData =
    _contract && 'abi' in _contract && 'address' in _contract;
  const { abi, address, provider } = (_contract as ContractData<TAbi>) ?? {};
  const chainId = _contract?.provider?.getChainId();

  return useNamedQuery('contractRead', {
    queryKey: QUERY_KEYS.contract(
      isContractData ? address?.toString() : _contract?.id?.toString(),
      chainId,
      args?.toString(),
    ),
    queryFn: async () => {
      const isValid = isContractData
        ? !!abi && !!address && !!provider
        : !!_contract && 'provider' in _contract;

      if (!isValid) {
        throw new Error(
          'Valind input `contract` is required to read the contract',
        );
      }
      const contract = isContractData
        ? new Contract(address, abi, provider)
        : (_contract as Contract);

      if (!contract?.functions?.[functionName]) {
        throw new Error(`Function ${functionName || ''} not found on contract`);
      }

      const wouldWriteToStorage =
        contract.functions[functionName].isReadOnly?.() !== undefined
          ? !contract.functions[functionName].isReadOnly()
          : Object.values(contract.interface.functions)
              .find((f) => f.name === functionName)
              ?.attributes?.find((attr) => attr.name === 'storage')
              ?.arguments?.includes('write');

      if (wouldWriteToStorage) {
        throw new Error(
          'Methods that write to storage should not be called with useContractRead',
        );
      }

      return args !== undefined
        ? contract.functions[functionName](args)
        : contract.functions[functionName]();
    },
  });
};
