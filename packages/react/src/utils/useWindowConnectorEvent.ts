import { Fuel, type FuelConnector, FuelConnectorEventType } from 'fuels';
import { useEffect } from 'react';

export function useWindowConnectorEvent(fuel: Fuel) {
  // https://github.com/FuelLabs/fuels-ts/commit/3b59f1fba06d4d2e4884c03bb5e77388394f2b32
  // On this PR the event listeners was delayed for after a ping what can cause issues with
  // the Wallet that is not connected.
  //
  // The solution for the problem would be to listen to the event and do check inside the handler
  // if the connector on the event is the current connector so select it.
  //
  // TODO: move this to the Fuel TS SDK
  useEffect(() => {
    const handler = (connector: CustomEvent<FuelConnector>) => {
      const currentFuelConnector = fuel.currentConnector();
      const currentConnector = localStorage.getItem(Fuel.STORAGE_KEY);
      if (currentConnector === connector.detail.name && !currentFuelConnector) {
        fuel.selectConnector(connector.detail.name, {
          emitEvents: false,
        });
      }
    };

    // biome-ignore lint/suspicious/noExplicitAny: This is a listener is not defined on window
    window.addEventListener(FuelConnectorEventType, handler as any);
    return () => {
      // biome-ignore lint/suspicious/noExplicitAny: This is a listener is not defined on window
      window.removeEventListener(FuelConnectorEventType, handler as any);
    };
  }, [fuel]);
}
