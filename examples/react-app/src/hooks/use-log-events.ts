import { useFuel } from '@fuels/react';
import { useEffect } from 'react';

export function useLogEvents() {
  const { fuel } = useFuel();

  useEffect(() => {
    const log = (prefix: string) => (data: unknown) => {
      console.log(prefix, data);
    };
    const logAccounts = log('accounts');
    const logConnection = log('connection');
    const logCurrentAccount = log('currentAccount');

    fuel.on(fuel.events.accounts, logAccounts);
    fuel.on(fuel.events.connection, logConnection);
    fuel.on(fuel.events.currentAccount, logCurrentAccount);
    return () => {
      fuel.off(fuel.events.accounts, logAccounts);
      fuel.off(fuel.events.connection, logConnection);
      fuel.off(fuel.events.currentAccount, logCurrentAccount);
    };
  }, [fuel]);

  return null;
}
