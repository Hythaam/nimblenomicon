import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  rulesSidebar: [
    {
      type: 'category',
      label: 'Core Rules',
      collapsed: false,
      items: [
        'rules/combat',
        'rules/conditions',
        'rules/actions',
        'rules/stats',
        'rules/hit-points',
        'rules/size-movement',
        'rules/grappling',
        'rules/resting',
        'rules/equipment',
        'rules/character-creation',
        'rules/ancestries',
        'rules/skills',
        'rules/spellcasting',
      ],
    },
  ],
  classesSidebar: [
    {
      type: 'category',
      label: 'Classes',
      collapsed: false,
      items: [
        'classes/index',
        'classes/berserker',
        'classes/cheat',
        'classes/commander',
        'classes/hunter',
        'classes/mage',
        'classes/oathsworn',
        'classes/shadowmancer',
        'classes/shepherd',
        'classes/songweaver',
        'classes/stormshifter',
        'classes/zephyr',
      ],
    },
  ],
  spellsSidebar: [
    {
      type: 'category',
      label: 'Spells',
      collapsed: false,
      items: [
        'spells/index',
        'spells/fire',
        'spells/ice',
        'spells/lightning',
        'spells/radiant',
        'spells/necrotic',
        'spells/wind',
      ],
    },
  ],
  monstersSidebar: [
    {
      type: 'category',
      label: 'Monsters',
      collapsed: false,
      items: [
        'monsters/index',
        'monsters/kobolds',
        'monsters/goblins',
        'monsters/bandits',
        'monsters/snakemen',
        'monsters/dungeon-denizens',
      ],
    },
  ],
  settingSidebar: [
    {
      type: 'category',
      label: 'Setting',
      collapsed: false,
      items: [
        'setting/index',
      ],
    },
  ],
};

export default sidebars;
