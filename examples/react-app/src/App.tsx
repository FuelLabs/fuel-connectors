import { useState } from 'react';
import Account from './components/account';
import Balance from './components/balance';
import Button from './components/button';
import Counter from './components/counter';
import Notification, {
  type Props as NotificationProps,
} from './components/notification';
import Transfer from './components/transfer';
import { useWallet } from './hooks/useWallet';

export default function App() {
  const {
    currentConnector,
    isConnected,
    isConnecting,
    isLoadingConnectors,
    isLoading,
    isFetching,
    connect,
  } = useWallet();

  const [isSigning, setIsSigning] = useState(false);
  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  return (
    <main
      data-theme="dark"
      className="flex items-center justify-center lg:h-screen dark:text-zinc-50/90"
    >
      <div id="container" className="mx-8 mb-32 w-full max-w-5xl lg:mb-0">
        <nav
          id="nav"
          className="flex items-center justify-center py-6 lg:pb-10 lg:pt-0"
        >
          <a href="https://fuel.network/" target="_blank" rel="noreferrer">
            <img src="./logo_white.png" alt="Fuel Logo" className="w-[124px]" />
          </a>
        </nav>

        <div className="gradient-border rounded-2xl">
          <div className="grain rounded-2xl p-1.5 drop-shadow-xl">
            <div
              id="grid"
              className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-12"
            >
              <div
                id="text"
                className="col-span-3 px-4 py-8 sm:px-8 sm:py-8 md:px-10 md:py-12"
              >
                <div className="flex h-20 items-end">
                  {currentConnector.logo && (
                    <img
                      src={currentConnector.logo}
                      alt={currentConnector.title}
                      className="w-20 h-20"
                    />
                  )}
                </div>
                <h1 className="pb-1 pt-6 text-3xl font-medium">
                  {currentConnector.title}
                </h1>
                <p>
                  Fuel enables developers to build integrations with any wallet.
                </p>

                <ul className="list-inside list-disc pt-8">
                  <li>Reduce friction for users</li>
                  <li>Build using any signature scheme</li>
                  <li>
                    Use predicates, a new type of stateless smart contract
                  </li>
                </ul>
                <a
                  href="https://github.com/FuelLabs/fuel-connectors"
                  target="_blank"
                  className="block pt-4 text-green-500/80 transition-colors hover:text-green-500"
                  rel="noreferrer"
                >
                  Build your own wallet integration
                </a>
              </div>

              <div className="col-span-4">
                <div className="gradient-border h-full rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950/80">
                  {!isConnected && (
                    <section className="flex h-full flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-8 md:px-10 md:py-12">
                      <Button
                        onClick={connect}
                        loading={isConnecting || isLoadingConnectors}
                        loadingText={
                          isLoadingConnectors
                            ? 'Connect Wallet'
                            : 'Connecting...'
                        }
                      >
                        Connect Wallet
                      </Button>
                    </section>
                  )}

                  {(isLoading ?? isFetching) && (
                    <section className="flex h-full flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-8 md:px-10 md:py-12">
                      <p>Loading...</p>
                    </section>
                  )}

                  {isConnected && !isLoading && (
                    <section className="flex h-full flex-col justify-center space-y-6 px-4 py-8 sm:px-8 sm:py-8 md:px-10 md:py-12">
                      <Account
                        isSigning={isSigning}
                        setIsSigning={setIsSigning}
                      />
                      <Balance
                        isSigning={isSigning}
                        setIsSigning={setIsSigning}
                      />
                      <Counter
                        isSigning={isSigning}
                        setIsSigning={setIsSigning}
                      />
                      <Transfer
                        isSigning={isSigning}
                        setIsSigning={setIsSigning}
                      />
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Notification
        setOpen={() => setToast({ ...toast, open: false })}
        {...toast}
      />
    </main>
  );
}
