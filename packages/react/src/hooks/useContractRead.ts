import { type Address, Contract, type JsonAbi, type Provider } from 'fuels';
import { useNamedQuery } from '../core/useNamedQuery';
import { QUERY_KEYS } from '../utils';

type ContractReadWithInstanceProps<
  C extends Contract,
  F extends keyof C['functions'],
> = {
  contract: C;
  functionName: F;
  args?: Parameters<C['functions'][F]>;
};

type ContractReadWithAbiProps<A extends JsonAbi> = {
  contract: {
    address: Address;
    abi: A;
    provider: Provider;
  };
  functionName: string;
  args?: unknown[];
};

type ContractReadProps<
  A extends JsonAbi,
  C extends Contract | ContractReadWithAbiProps<A>['contract'],
  F extends C extends Contract ? keyof C['functions'] : string,
> = C extends Contract
  ? ContractReadWithInstanceProps<C, F>
  : ContractReadWithAbiProps<A>;

const isContract = <A extends JsonAbi, C extends Contract>(
  contract: Contract | ContractReadWithAbiProps<A>['contract'],
): contract is C => {
  return 'functions' in contract;
};

/**
 * A hook to read data from a smart contract in the connected app.
 *
 * @params {object} The properties of the hook.
 * - `contract`: The contract instance.
 * - `functionName`: The name of the function to call on the contract.
 * - `args`: The arguments to pass to the contract function.
 *
 * @returns {object} An object containing:
 * - The result of the contract function call.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @throws {Error} Throws an error if the contract or function is invalid or if the function attempts to write to storage.
 *
 * @examples
 * To read data from a contract
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
  A extends JsonAbi,
  C extends Contract | ContractReadWithAbiProps<A>['contract'],
  F extends C extends Contract ? keyof C['functions'] : string,
>({
  contract: _contract,
  functionName,
  args,
}: ContractReadProps<A, C, F>) => {
  const isContractInstance = isContract(_contract);
  const chainId = _contract?.provider?.getChainId();

  return useNamedQuery('contractRead', {
    queryKey: QUERY_KEYS.contract(
      isContractInstance
        ? _contract?.id?.toString()
        : _contract?.address?.toString(),
      chainId,
      args?.toString(),
    ),
    queryFn: async () => {
      const isValid = isContractInstance
        ? !!_contract && 'provider' in _contract
        : !!_contract.abi && !!_contract.address && !!_contract.provider;

      if (!isValid) {
        throw new Error(
          'Invalid input `contract` is required to read the contract',
        );
      }
      const contract = isContractInstance
        ? _contract
        : new Contract(_contract.address, _contract.abi, _contract.provider);

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
