import { type Address, Contract, type JsonAbi, type Provider } from 'fuels';
import type { FunctionNames, InputsForFunctionName } from '../types';

import { useNamedQuery } from '../core/useNamedQuery';
import { QUERY_KEYS } from '../utils';

type ContractData<TAbi extends JsonAbi> = {
  /**
   * The address of the contract.
   */
  address: Address;
  /**
   * The ABI of the contract.
   */
  abi: TAbi;
  /**
   * The provider used to interact with the contract.
   */
  provider: Provider;
};

type ContractReadProps<
  TAbi extends JsonAbi,
  TFunctionName extends FunctionNames<TAbi>,
> = {
  /**
   * The contract instance or contract data (address, ABI, and provider).
   */
  contract: Contract | ContractData<TAbi>;
  /**
   * The name of the function to call on the contract.
   */
  functionName: TFunctionName;
  /**
   * The arguments to pass to the contract function.
   */
  args: InputsForFunctionName<TAbi, TFunctionName>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to read data from a smart contract in the connected app.
 *
 * @template TAbi - The ABI of the contract.
 * @template TFunctionName - The name of the function to call on the contract.
 * @param {ContractReadProps<TAbi, TFunctionName>} props - The properties of the hook.
 * @returns {object} An object containing:
 * - The result of the contract function call.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 *
 * @throws {Error} Throws an error if the contract or function is invalid or if the function attempts to write to storage.
 *
 * @example To read data from a contract
 * ```ts
 * const { data } = useContractRead({
 *   contract: myContractInstance,
 *   functionName: 'getBalance',
 *   args: [userAddress],
 * });
 * console.log(data);
 * ```
 */
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
