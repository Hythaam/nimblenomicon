import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Nimblenomicon',
  tagline: 'An Online Nimble TTRPG rules reference',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://hythaam.githubpages.io',
  baseUrl: '/nimblenomicon',

  organizationName: 'hythaam',
  projectName: 'nimblenomicon',
  deploymentBranch: 'main',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    require.resolve('./plugins/docusaurus-plugin-snippets'),
    require.resolve('./plugins/docusaurus-plugin-local-search'),
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: undefined,
          exclude: ['snippets/**'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Nimblenomicon',
      logo: {
        alt: 'Nimblenomicon Logo',
        src: 'img/book-icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'rulesSidebar',
          position: 'left',
          label: 'Rules',
        },
        {
          type: 'docSidebar',
          sidebarId: 'classesSidebar',
          position: 'left',
          label: 'Classes',
        },
        {
          type: 'docSidebar',
          sidebarId: 'spellsSidebar',
          position: 'left',
          label: 'Spells',
        },
        {
          type: 'docSidebar',
          sidebarId: 'monstersSidebar',
          position: 'left',
          label: 'Monsters',
        },
        {
          type: 'docSidebar',
          sidebarId: 'settingSidebar',
          position: 'left',
          label: 'Setting',
        },
        {
          type: 'search',
          position: 'right',
        },
        // {
        //   to: '/search',
        //   label: '🔍 Search',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Reference',
          items: [
            { label: 'Rules', to: '/rules/combat' },
            { label: 'Conditions', to: '/reference/conditions/blinded' },
            { label: 'Search', to: '/search' },
          ],
        },
        {
          title: 'Content',
          items: [
            { label: 'Classes', to: '/classes/' },
            { label: 'Spells', to: '/spells/' },
            { label: 'Monsters', to: '/monsters/' },
          ],
        },
      ],
      copyright: `Nimblenomicon — Nimble TTRPG Reference. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
