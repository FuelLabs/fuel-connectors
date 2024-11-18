import { Provider } from 'fuels';
import { useEffect, useState } from 'react';
import { useNetwork } from './useNetwork';

export const useProviderNetwork = () => {
  const { network } = useNetwork();
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    async function createProvider() {
      if (network?.url) {
        const fuelProvider = await Provider.create(network?.url);
        setProvider(fuelProvider);
      }
    }

    createProvider();
  }, [network?.url]);

  return { provider };
};
