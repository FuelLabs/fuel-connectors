import { defineConfig } from 'vitepress';
import hooksLinks from '../.typedoc/hooks-links.json';
import { codeInContextPlugin } from './plugins/codeInContextPlugin';
import { snippetPlugin } from './plugins/snippetPlugin';

export default defineConfig({
  title: 'Fuel Connectors',
  description: 'Fuel Connectors Documentation',
  srcDir: 'src',
  outDir: 'dist',
  lang: 'en-US',
  appearance: 'dark',
  markdown: {
    config: (md) => {
      md.use(snippetPlugin);
      md.use(codeInContextPlugin);
      md.block.ruler.disable('snippet');
    },
  },
  head: [
    [
      'link',
      { rel: 'icon', href: '/fuel-connectors/favicon.ico', type: 'image/png' },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:url',
        content: 'https://fuellabs.github.io/fuel-connectors/',
      },
    ],
  ],
  themeConfig: {
    logo: 'fuel-logo.png',
    nav: [
      {
        text: 'Home',
        link: '/',
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/FuelLabs/fuel-connectors' },
      { icon: 'twitter', link: 'https://twitter.com/fuel_network' },
      { icon: 'discord', link: 'https://discord.com/invite/xfpK4Pe' },
    ],
    editLink: {
      pattern:
        'https://github.com/fuellabs/fuel-connectors/edit/master/packages/docs/src/:path',
      text: 'Edit this page on GitHub',
    },
    sidebar: [
      {
        items: [
          {
            text: 'Getting Started',
            link: '/guide/getting-started/',
            items: [
              {
                text: 'About',
                link: '/guide/getting-started/about',
              },
              {
                text: 'Installation',
                link: '/guide/getting-started/installation',
              },
            ],
          },
          {
            text: 'Usage',
            link: '/guide/usage',
            items: [
              {
                text: 'Connecting',
                link: '/guide/usage/connecting',
              },
              {
                text: 'Accounts',
                link: '/guide/usage/accounts',
              },
              {
                text: 'Assets',
                link: '/guide/usage/assets',
              },
              {
                text: 'Sign Transaction',
                link: '/guide/usage/sign-transaction',
              },
              {
                text: 'Sign Message',
                link: '/guide/usage/sign-message',
              },
              {
                text: 'Networks',
                link: '/guide/usage/networks',
              },
              {
                text: 'ABIs',
                link: '/guide/usage/abis',
              },
              {
                text: 'Wallet Connectors',
                link: '/guide/usage/wallet-connectors',
              },
            ],
          },
          {
            text: 'Configuration',
            link: '/guide/configuration',
            items: [
              {
                text: '_targetObject',
                link: '/guide/configuration/_targetObject',
              },
              {
                text: 'Storage',
                link: '/guide/configuration/storage',
              },
              {
                text: 'Connectors',
                link: '/guide/configuration/connectors',
              },
            ],
          },
          {
            text: 'Connectors',
            link: '/guide/connectors',
            items: [
              {
                text: 'defaultConnectors',
                link: '/guide/connectors/defaultConnectors',
                items: [
                  {
                    text: 'devMode',
                    link: '/guide/connectors/defaultConnectors/devMode',
                  },
                  {
                    text: 'wcProjectId',
                    link: '/guide/connectors/defaultConnectors/wcProjectId',
                  },
                  {
                    text: 'BurnerWalletConfig',
                    link: '/guide/connectors/defaultConnectors/burnerWalletConfig',
                  },
                  {
                    text: 'ethWagmiConfig',
                    link: '/guide/connectors/defaultConnectors/ethWagmiConfig',
                  },
                  {
                    text: 'solanaConfig',
                    link: '/guide/connectors/defaultConnectors/solanaConfig',
                  },
                ],
              },
              {
                text: 'Ethereum',
                link: '/guide/connectors/ethereum',
                items: [
                  {
                    text: 'wagmiConfig',
                    link: '/guide/connectors/wagmiConfig',
                  },
                  {
                    text: 'WalletConnect',
                    link: '/guide/connectors/wallet-connect',
                  },
                  {
                    text: 'EVM Connector',
                    link: '/guide/connectors/evm-connector',
                  },
                ],
              },
              {
                text: 'Bako Safe',
                link: '/guide/connectors/bako-safe',
              },
              {
                text: 'Burner Wallet',
                link: '/guide/connectors/burner-wallet',
              },
              {
                text: 'Fuel Development Wallet',
                link: '/guide/connectors/fuel-development-wallet',
              },
              {
                text: 'Fuel Wallet',
                link: '/guide/connectors/fuel-wallet',
              },
              {
                text: 'Fuelet Wallet',
                link: '/guide/connectors/fuelet-wallet',
              },
              {
                text: 'Solana',
                link: '/guide/connectors/solana',
              },
            ],
          },
          {
            text: 'With React',
            link: '/guide/with-react',
            items: [
              {
                text: 'Installation',
                link: '/guide/with-react/installation',
              },
              {
                text: 'React Query',
                link: '/guide/with-react/react-query',
              },
              {
                text: 'Fuel Provider',
                link: '/guide/with-react/fuel-provider',
                items: [
                  {
                    text: 'theme',
                    link: '/guide/with-react/fuel-provider/theme',
                  },
                  {
                    text: 'ui',
                    link: '/guide/with-react/fuel-provider/ui',
                  },
                  {
                    text: 'fuelConfig',
                    link: '/guide/with-react/fuel-provider/fuel-config',
                  },
                ],
              },
              {
                text: 'React Hooks',
                link: '/guide/react-hooks',
                collapsed: true,
                items: [...hooksLinks],
              },
            ],
          },
          {
            text: 'Build your Connector',
            link: '/guide/build-your-connector',
            items: [
              {
                text: 'Contribution Guide',
                link: '/guide/build-your-connector/contribution-guide',
              },
              {
                text: 'Create a Connector',
                link: '/guide/build-your-connector/create-new-connector',
              },
              {
                text: 'Running locally',
                link: '/guide/build-your-connector/running-locally',
              },
            ],
          },
        ],
      },
    ],
  },
});
