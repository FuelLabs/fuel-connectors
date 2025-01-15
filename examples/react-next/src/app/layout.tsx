import { Providers } from '@/components/Providers';
import { DEFAULT_WAGMI_CONFIG } from '@/config/config';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { get } = await headers();
  const wagmiInitialState = cookieToInitialState(
    DEFAULT_WAGMI_CONFIG,
    get('cookie'),
  );

  return (
    <html lang="en">
      <body>
        <Providers initialState={wagmiInitialState}>{children}</Providers>
      </body>
    </html>
  );
}
