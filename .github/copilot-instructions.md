# Copilot Instructions — Nimblenomicon

Nimblenomicon is a static Docusaurus 3 site — a searchable rules reference for the **Nimble TTRPG**. Content is authored in MDX (`docs/`) and structured JSON snippets (`docs/snippets/`). Two custom Docusaurus plugins power snippets-as-routes and client-side Lunr search.

## Commands

```bash
npm start          # Dev server with hot reload
npm run build      # Production build
npm run typecheck  # TypeScript validation (tsc) — primary way to validate changes
npm run serve      # Serve production build locally
npm run clear      # Clear Docusaurus cache (use when builds behave unexpectedly)
```

There are no test or lint scripts. `npm run typecheck` is the main validation step.

## Architecture

### Content pipeline

```
docs/snippets/*.json  ──► docusaurus-plugin-snippets ──► /reference/{category}s/{id} routes
                                                      ──► tooltip registry (global plugin data)

docs/**/*.mdx         ──► docusaurus-plugin-local-search ──► Lunr indexes ──► /search route
```

- `docs/` — Published MDX content (rules, classes, spells, monsters, setting, items)
- `docs/snippets/` — JSON files with structured game concepts (conditions, actions, keywords, traits)
- `reference-docs/` — Internal source material only (PDFs, Obsidian vault); **not served to users**
- `lib/` — Build-time utilities shared between plugins and config (snippet loading, search indexing, URL paths)
- `plugins/` — Two custom Docusaurus plugins (snippets and local search)
- `src/components/` — React components used in MDX and pages
- `src/theme/` — Swizzled Docusaurus theme overrides

### The two custom plugins

**`plugins/docusaurus-plugin-snippets`** — Reads all `docs/snippets/*.json`, validates them, creates a dynamic route per snippet, and exposes a tooltip registry as global plugin data.

**`plugins/docusaurus-plugin-local-search`** — Walks `docs/` (skipping `snippets/`), builds two Lunr indexes (one for snippets, one for docs), and creates the `/search` route.

Both plugins use utilities from `lib/`.

## Snippets

Snippets are the primary content primitive for game concepts (conditions, actions, keywords, traits). Each is a JSON file in `docs/snippets/`:

```json
{
  "id": "blinded",
  "category": "condition",
  "title": "Blinded",
  "aliases": ["blind"],
  "tags": ["condition", "debuff", "combat"],
  "summary": "Short description used in search results.",
  "tooltipBody": "Text shown in hover tooltips.",
  "body": "Full rule text shown on the detail page.",
  "relatedIds": ["invisible", "darkvision"],
  "externalLinks": [
    { "label": "Vision Mechanics", "path": "/docs/rules/vision" },
    { "label": "Combat Conditions", "path": "/docs/rules/combat#conditions" }
  ]
}
```

- `id` is used to form the URL: `/reference/conditions/blinded`
- `aliases` are normalized (lowercase, spaces → hyphens) for lookup in the tooltip registry
- `relatedIds` links to other snippet IDs (cross-references within the reference)
- `externalLinks` (optional) links to documentation pages via `label` and `path`. These appear in a "Learn More" section below "Related" snippets
- All required fields are: `id`, `category`, `title`, `aliases`, `tags`, `summary`, `tooltipBody`, `body`, `relatedIds`; see `lib/reference/schema.ts` for the full `SnippetRecord` and `ExternalLink` types

## MDX Content Conventions

### Frontmatter
```yaml
---
title: Combat          # Used by search indexing
sidebar_label: Combat  # Displayed in the sidebar nav
---
```

### Custom components (globally registered in `src/theme/MDXComponents.tsx`)

```mdx
<RuleRef id="grappled" label="Grappled" />        <!-- Inline link + hover tooltip -->
<Callout type="tip" title="Optional title">...</Callout>   <!-- tip | warning | note | danger | info -->
<StatBlock name="..." stats={...} description="..." />     <!-- Monster/NPC stat block -->
<CategoryBadge category="condition" />            <!-- Visual category pill -->
```

`<RuleRef>` is the standard way to cross-reference any snippet from MDX. Do not use raw markdown links for snippet references.

## Sidebars

Five independent sidebars defined in `sidebars.ts`: `rulesSidebar`, `classesSidebar`, `spellsSidebar`, `monstersSidebar`, `settingSidebar`. Each maps to a top-level navbar item. New docs must be added to the appropriate sidebar manually — there is no auto-generated sidebar.

## TypeScript

`tsconfig.json` extends `@docusaurus/tsconfig` (strict defaults). The `baseUrl: "."` allows root-relative imports. Plugin and lib code runs at build time in Node; component code runs in the browser/SSR.
