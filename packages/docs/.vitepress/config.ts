import { defineConfig } from 'vitepress';
import apiLinks from '../.typedoc/api-links.json';
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
            collapsed: true,
            items: [
              {
                text: 'Installation',
                link: '/guide/getting-started/installation',
              },
            ],
          },
        ],
      },
    ],
  },
});
