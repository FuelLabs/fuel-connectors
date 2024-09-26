import * as DialogRadix from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { getThemeVariables } from '../../../../constants/themes';
import { DialogOverlay, FuelRoot } from './styles';

export function DialogFuel({
  children,
  theme,
  ...props
}: DialogRadix.DialogProps & { theme: string }) {
  // const currentConnector = fuel.currentConnector();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <DialogRadix.Root {...props}>
      <DialogRadix.Portal>
        <DialogOverlay asChild>
          <FuelRoot
            style={
              isClient
                ? {
                    display: props.open ? 'block' : 'none',
                    ...getThemeVariables(theme),
                  }
                : undefined
            }
          >
            {children}
          </FuelRoot>
        </DialogOverlay>
      </DialogRadix.Portal>
    </DialogRadix.Root>
  );
}
