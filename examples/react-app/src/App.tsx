import { useState } from 'react';
import Button from './components/button';

import Notification, {
  type Props as NotificationProps,
} from './components/notification';

import Account from './components/account';
import Balance from './components/balance';
import Counter from './components/counter';
import Transfer from './components/transfer';

import Sign from './components/sign';
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
      className="flex items-center justify-center lg:h-screen dark:text-zinc-50/90 relative overflow-hidden"
    >
      {/* Floating animation background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-500/10 rounded-full animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full animate-ping" />
      </div>

      <div
        id="container"
        className="mx-8 mb-32 w-full max-w-5xl lg:mb-0 relative z-10"
      >
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
                      alt={currentConnector.name}
                      className="w-20 h-20"
                    />
                  )}
                </div>
                <h1 className="pb-1 pt-6 text-3xl font-medium bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {currentConnector?.name ?? 'Fuel Wallet Integration Demo'}
                </h1>
                <p className="text-lg">
                  Experience seamless blockchain interactions with Fuel's
                  next-generation wallet connectors. Build faster, deploy
                  smarter, connect everywhere.
                </p>

                <ul className="list-inside list-disc pt-8 space-y-2">
                  <li className="text-green-400">
                    🚀 Reduce friction for users
                  </li>
                  <li className="text-blue-400">
                    🔧 Build using any signature scheme
                  </li>
                  <li className="text-purple-400">
                    ⚡ Use predicates, a new type of stateless smart contract
                  </li>
                  <li className="text-yellow-400">
                    🌐 Cross-platform compatibility
                  </li>
                </ul>
                <a
                  href="https://github.com/FuelLabs/fuel-connectors"
                  target="_blank"
                  className="inline-block pt-4 text-green-500/80 transition-all duration-300 hover:text-green-400 hover:scale-105"
                  rel="noreferrer"
                >
                  Build your own wallet integration →
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
                      <Sign isSigning={isSigning} setIsSigning={setIsSigning} />
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
