import type {
  DefaultError,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type ExcludeData<T> = Omit<T, 'data'>;

type NamedUseQueryResult<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
> = ExcludeData<UseQueryResult<TQueryFnData, TError>> & {
  [key in TName]: UseQueryResult<TQueryFnData, TError>['data'];
};

type DefinedNamedUseQueryResult<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
> = ExcludeData<DefinedUseQueryResult<TQueryFnData, TError>> & {
  [key in TName]: DefinedUseQueryResult<TQueryFnData, TError>['data'];
};

/**
 * TanStack Query parameters, like queryFn and queryKey, are used internally and you cannot override them.
 * Currently we're exporting only "select" function.
 *
 * See docs for more information: https://tanstack.com/query/latest/docs/framework/react/reference/useQuery
 */
export interface UseNamedQueryParams<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Pick<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'select' | 'refetchInterval' | 'refetchOnWindowFocus' | 'staleTime'
  > {
  name?: TName;
}

function createProxyHandler<
  TName extends string,
  TData = unknown,
  TError = DefaultError,
>(name: TName) {
  const handlers: ProxyHandler<UseQueryResult<TData, TError>> = {
    get(target, prop) {
      const shouldReplaceData = prop === name;
      return Reflect.get(target, shouldReplaceData ? 'data' : prop);
    },
  };

  return handlers;
}

/**
 * When initialData is not provided "data" will be always TQueryFnData | undefined.
 * It might need some type checking to be sure that the data is not undefined.
 */
export function useNamedQuery<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  name: TName,
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): NamedUseQueryResult<TName, TData, TError>;

/**
 * When initialData is provided "data" will be always TQueryFnData.
 * Never undefined.
 */
export function useNamedQuery<
  TName extends string,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  name: TName,
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): DefinedNamedUseQueryResult<TName, TData, TError>;

/**
 * useNamedQuery is a wrapper for useQuery that allows you to override the "data" property with a custom name.
 *
 * @param name a identifier to override "data" property with this name
 * @param options UseQueryOptions
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
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): NamedUseQueryResult<TName, TData, TError> {
  const query = useQuery(options, queryClient);

  const proxy = useMemo(() => {
    return new Proxy(query, createProxyHandler(name)) as NamedUseQueryResult<
      TName,
      TData,
      TError
    >;
  }, [name, query]);

  return proxy;
}
