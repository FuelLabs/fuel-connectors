import type {
  DefaultError,
  DefinedUseQueryResult,
  QueryClient,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type ExcludeData<T> = Omit<T, 'data'>;
type ExcludePlaceholderData<T> = Omit<T, 'placeholderData'>;

export type DefinedNamedUseQueryResult<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
> = ExcludeData<DefinedUseQueryResult<TQueryFnData, TError>> & {
  [key in TName]: DefinedUseQueryResult<TQueryFnData, TError>['data'];
};

/**
 * TanStack Query parameters for external usage.
 * Parameters like `queryFn` and `queryKey` are used internally and you cannot override them.
 *
 * See docs for more information: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
 */
export interface UseNamedQueryParams<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn' | 'enabled' | 'initialData' | 'placeholderData'
  > {
  name?: TName;
}

/**
 * TanStack Query parameters for internal usage (inside @fuels/react).
 * This is only used for making the `placeholderData` property required.
 *
 * See docs for more information: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
 */
interface UseNamedQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends ExcludePlaceholderData<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
  > {
  placeholderData: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >['placeholderData'];
}

function createProxyHandler<
  TName extends string,
  TData = unknown,
  TError = DefaultError,
>(name: TName) {
  const handlers: ProxyHandler<UseQueryResult<TData, TError>> = {
    get(target, prop) {
      const shouldReplaceData = prop === name;
      if (shouldReplaceData) {
        return Reflect.get(target, 'data');
      }

      return Reflect.get(target, prop);
    },
  };

  return handlers;
}

/**
 * useNamedQuery is a wrapper for useQuery that allows you to override the "data" property with a custom name.
 *
 * @param name a identifier to override "data" property with this name
 * @param options UseNamedQueryOptions
 * @returns useQuery
 */
export function useNamedQuery<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  name: TName,
  options: UseNamedQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): DefinedNamedUseQueryResult<TName, TData, TError> {
  const query = useQuery(options, queryClient);

  const proxy = useMemo(() => {
    return new Proxy(
      query,
      createProxyHandler(name),
    ) as DefinedNamedUseQueryResult<TName, TData, TError>;
  }, [name, query]);

  return proxy;
}
