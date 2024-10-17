'use client';

import '../index.css';
import * as Toast from '@radix-ui/react-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <Toast.Provider>
            {children}
            <Toast.Root />
          </Toast.Provider>
          {isDev && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </body>
    </html>
  );
}
