# TTRPG Reference Site Architecture

## Purpose

This project is a Docusaurus-based reference site for a tabletop RPG. The site is designed around four goals:

- **Docs-first reference content** for rules, classes, spells, monsters, and other setting material.
- **Reusable shared snippets** for atomic rule concepts such as conditions, actions, keywords, traits, and glossary terms.
- **Inline rule references** that can render shared snippet content as tooltips/popovers inside documentation pages.
- **Fully local search** using pre-built Lunr indexes, with no hosted search dependency.

The result should feel like a polished RPG compendium, not generic software documentation.

---

## High-level design

The system has three layers:

1. **Content layer**
   - Long-form docs live in `docs/` as MDX.
  - Shared snippets live in `docs/snippets/` as structured JSON.

2. **Build layer**
   - Docusaurus builds the main docs routes.
   - A custom snippets plugin turns snippet data into canonical snippet pages and a compact tooltip registry.
   - A custom local-search plugin builds two Lunr indexes: one for docs and one for snippets.

3. **UI layer**
   - React components render inline references, tooltips, snippet pages, search results, and custom RPG-themed UI.
   - Swizzled Docusaurus theme components control layout, navigation, and visual customization.

### Architectural principle

**Snippets are first-class content objects.**

A condition like `grappled` or a keyword like `advantage` should exist once in structured data and then power:

- inline tooltips
- canonical detail pages
- local search results
- future cross-links/backlinks

That avoids copy/paste rules text and makes updates safe.

---

## Recommended repository layout

```text
site/
  docusaurus.config.ts
  sidebars.ts

  docs/
    rules/
    classes/
    spells/
    monsters/
    setting/

    snippets/
      conditions.json
      actions.json
      keywords.json
      traits.json

  lib/
    reference/
      schema.ts
      loadSnippets.ts
      paths.ts
      tooltipRegistry.ts
    search/
      buildDocsRecords.ts
      buildSnippetRecords.ts
      rankResults.ts

  plugins/
    docusaurus-plugin-snippets/
      index.ts
    docusaurus-plugin-local-search/
      index.ts

  src/
    components/
      reference/
        RuleRef.tsx
        SnippetTooltip.tsx
        SnippetLink.tsx
        SnippetPage.tsx
      search/
        SearchPage.tsx
        SearchInput.tsx
        SearchResults.tsx
        ResultGroup.tsx
      design/
        StatBlock.tsx
        CategoryBadge.tsx
        Callout.tsx

    theme/
      DocItem/
      Navbar/
      SearchBar/
      MDXComponents.tsx

    css/
      custom.css

  static/
    img/
    fonts/
```

### Directory responsibilities

- `docs/`: authored, reader-facing documentation pages.
- `docs/snippets/`: source of truth for shared snippet content.
- `lib/`: pure utilities shared by plugins and client code.
- `plugins/`: custom Docusaurus plugins for snippet pages and local search.
- `src/components/`: React UI components.
- `src/theme/`: swizzled Docusaurus theme components.
- `static/`: static assets only; not generated search data.

---

## Core platform choice

The site uses **Docusaurus** as the documentation framework.

Why:

- It is strong for docs-oriented sites.
- Docs are written in **MDX**, so documentation pages can embed React components directly.
- The plugin system is a good fit for generated snippet pages and custom local search.
- Theme swizzling gives deep control over layout and presentation.

Recommended baseline:

- `@docusaurus/preset-classic`
- docs as the primary content feature
- no docs versioning initially
- `routeBasePath: '/'` if the entire site is the reference manual

If the project later needs a marketing home page, the docs can move under `/docs`.

---

## Major components

## 1. Docs content (`docs/`)

### What it contains

Long-form, human-authored pages such as:

- core rules chapters
- class pages
- spell pages
- monster pages
- setting or lore pages

These pages are written as `.mdx` files so they can embed React components.

### Authoring rule

Use docs for **narrative or page-shaped content**.

Examples:

- combat overview
- action economy explanation
- class progression page
- spell list page
- monster tactics page

### Example MDX usage

```mdx
A creature that is <RuleRef id="grappled" /> cannot move until the grapple ends.

A shove can be used to push a target or knock it prone; see <RuleRef id="shove" />.
```

### Why MDX matters here

MDX allows docs pages to behave like structured reference pages rather than plain markdown. That is the foundation for inline tooltips, stat blocks, tabs, and other custom UI.

---

## 2. Snippet registry (`docs/snippets/`)

### What it contains

Structured records for reusable, atomic reference content.

Common categories:

- conditions
- actions
- keywords
- traits
- status effects
- glossary terms

A snippet is small enough to show in a tooltip, but important enough to deserve a canonical page.

### Suggested schema

Each snippet should have at least:

- `id`: stable unique key
- `category`: `condition`, `action`, `keyword`, etc.
- `title`: display name
- `aliases`: alternate search terms
- `tags`: structured labels
- `summary`: one-line description for search/results
- `tooltipBody`: short text safe for tooltip rendering
- `body`: full canonical text
- `relatedIds`: optional related snippets

### Example snippet record

```json
{
  "id": "grappled",
  "category": "condition",
  "title": "Grappled",
  "aliases": ["grapple", "grappled condition"],
  "tags": ["condition", "movement"],
  "summary": "Your speed becomes 0.",
  "tooltipBody": "Your speed becomes 0, and you cannot benefit from bonuses to speed.",
  "body": "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed...",
  "relatedIds": ["shove", "restrained"]
}
```

### Design rule

A snippet should be edited in one place only. Docs pages should reference it, never duplicate its text.

---

## 3. Shared reference utilities (`lib/reference/`)

This directory holds pure utilities that are used by both plugins and React components.

### Main responsibilities

- validate snippet data
- load snippet files from disk
- compute canonical paths
- derive a compact tooltip registry from full snippet data

### Important modules

- `schema.ts`: schema validation for snippet records
- `loadSnippets.ts`: reads and normalizes snippet source files
- `paths.ts`: computes canonical URLs such as `/reference/conditions/grappled`
- `tooltipRegistry.ts`: builds the compact data used by inline tooltips

### Why this layer exists

Docusaurus plugins run in Node, while theme/components run in the browser bundle. Shared pure utilities prevent duplicated logic and keep path/schema rules consistent.

---

## 4. Snippets plugin (`plugins/docusaurus-plugin-snippets/`)

This is the custom content plugin for snippet pages.

### Responsibilities

- load and validate all snippets from `docs/snippets/`
- create one canonical page per snippet
- expose a **small** tooltip registry as plugin global data

### Output

- routes such as `/reference/conditions/grappled`
- route modules for `SnippetPage.tsx`
- a compact tooltip registry available to inline reference components

### Why the tooltip registry is compact

Tooltip data needs to be available across docs pages, so it is exposed globally. Keep it intentionally small:

- `id`
- `title`
- `category`
- `summary`
- `tooltipBody`
- `url`

Do **not** put large full-text bodies for every snippet into global data.

### Route strategy

Each snippet gets a stable canonical URL. That makes snippets linkable, searchable, and indexable as first-class pages.

Recommended pattern:

- `/reference/conditions/:id`
- `/reference/actions/:id`
- `/reference/keywords/:id`

---

## 5. Inline reference components (`src/components/reference/`)

These components are the main author-facing integration point.

### `RuleRef`

Used inline in MDX.

Responsibilities:

- resolve a snippet by `id`
- render the visible label
- show a tooltip/popover using compact registry data
- link to the canonical snippet page

### `SnippetTooltip`

Renders the hover/focus/tap UI.

Recommended contents:

- snippet title
- category badge
- short tooltip text
- “Open full entry” link

### `SnippetLink`

Use for references that should behave like plain links with no hover UI.

### `SnippetPage`

Renders the canonical page for a snippet. It should use the same design language as docs pages, but it is not authored in `docs/`; it is generated from snippet data.

### Accessibility expectations

- tooltips must work with keyboard focus, not only hover
- mobile should use tap/popover behavior instead of hover-only UI
- canonical page links must always be available

---

## 6. Custom local search plugin (`plugins/docusaurus-plugin-local-search/`)

This plugin implements the **custom local search pipeline**.

### Responsibilities

- build a **docs Lunr index** from `docs/`
- build a **snippet Lunr index** from the full snippet registry
- emit the serialized indexes and result stores with `createData`
- add a `/search` route that receives those generated data files as route modules

### Why this is a custom plugin

The project needs search behavior that is more specialized than a generic docs search integration:

- snippets and docs are separate content types
- snippets need their own ranking rules
- results should be grouped instead of blended into one flat list
- the site should have no hosted search dependency

### Search route

The search plugin owns a dedicated route:

- `/search`

That page receives the generated indexes and stores as route data. This keeps heavy search assets off normal docs pages.

### Search artifacts

The plugin should emit four data artifacts:

- `docs-index.json`
- `docs-store.json`
- `snippets-index.json`
- `snippets-store.json`

#### Index files

Serialized Lunr indexes.

#### Store files

Display-oriented metadata for rendering results, such as:

- title
- URL
- category
- summary/excerpt
- breadcrumbs

Keeping the stores separate from the indexes makes it easier to tune search ranking without changing UI rendering data.

---

## 7. Search indexing model

### Docs index

Indexes full documentation pages and optionally heading-level sections.

Recommended indexed fields:

- `title` (high boost)
- `headings` (medium-high boost)
- `body` (medium boost)
- optional `tags` or section metadata

Each doc result record should include:

- `id`
- `title`
- `url`
- `breadcrumbs`
- `body`
- optional `headings`

### Snippet index

Indexes the full snippet registry.

Recommended indexed fields:

- `title` (highest boost)
- `aliases` (high boost)
- `tags` (medium boost)
- `summary` (medium boost)
- `body` (lower boost)

Each snippet result record should include:

- `id`
- `title`
- `category`
- `url`
- `summary`
- `aliases`
- `body`

### Ranking rule

Snippet results should generally feel more direct than page results. Searching for `grappled` should return the `Grappled` snippet before broad rules chapters that happen to mention the word.

---

## 8. Search UI (`src/components/search/`)

The search page should be a custom React experience rather than a generic widget.

### Main components

- `SearchPage.tsx`: route entry for `/search`
- `SearchInput.tsx`: query box and keyboard handling
- `SearchResults.tsx`: top-level results layout
- `ResultGroup.tsx`: grouped results for snippets and docs

### Expected UX

- one search box
- results grouped into **Snippets** and **Documentation**
- snippets show concise summaries and category badges
- docs show titles, breadcrumbs, and short excerpts
- optional filters later: conditions, actions, spells, monsters, etc.

### Why a dedicated page first

A dedicated `/search` page keeps the first implementation simple and avoids loading large indexes on every route. A modal can be added later by reusing the same result components.

---

## 9. Theme and visual customization (`src/theme/`, `src/css/`)

Docusaurus theme components are customized through **swizzling**.

### Responsibilities

- change docs layout density and typography
- customize navbar and footer
- add a search entry point in the navigation
- style docs pages and snippet pages consistently
- give the site a distinct RPG/compendium look

### Recommended theme overrides

- `src/theme/DocItem/`: customize doc page wrapper
- `src/theme/Navbar/`: add project-specific navigation/search affordances
- `src/theme/SearchBar/`: link to `/search` or open the search UI later
- `src/theme/MDXComponents.tsx`: register global MDX components like `RuleRef`

### Styling strategy

- use `src/css/custom.css` for design tokens and global styles
- keep reusable UI primitives in `src/components/design/`
- prefer component-level styling for bespoke widgets

---

## 10. Build and data flow

```text
docs/*.mdx -------------------------------> Docusaurus docs plugin --> docs routes

docs/snippets/*.json ----> snippets plugin -------------------------> snippet routes
                             \-> compact tooltip registry ----------> RuleRef / SnippetTooltip

(docs source + full snippets) --> local-search plugin -------------> Lunr indexes + /search route
```

### Build sequence

1. Docs pages are built by the standard Docusaurus docs plugin.
2. The snippets plugin loads snippet data, validates it, creates canonical snippet routes, and exposes compact tooltip data.
3. The local-search plugin builds and serializes the docs/snippets Lunr indexes and adds the `/search` route.
4. Swizzled theme components and custom React components render the final UI.

---

## 11. Authoring workflow

### Adding a normal docs page

1. Create a new `.mdx` file in `docs/`.
2. Write content normally.
3. Use `RuleRef` when referencing shared rules.

### Adding a new snippet

1. Add a record to the appropriate file under `docs/snippets/`.
2. Rebuild the site.
3. The snippet will automatically become available in:
   - tooltips
   - canonical snippet page routes
   - local snippet search

### Editing a rule

If a rule exists as a snippet, edit the snippet record instead of changing every doc page that mentions it.

---

## 12. Deliberate design decisions

### Snippets are not just tooltip text

They are treated as independent content with their own IDs, URLs, and search records.

### Search is fully local

There is no Algolia or external service dependency. Search indexes are built during site generation.

### Dedicated search page before modal search

A route-based search page keeps the first implementation simpler and keeps search assets scoped to one route.

### No docs versioning initially

Versioning adds routing and indexing complexity. Add it later only if the game truly needs multiple published rules editions.

---

## 13. Implementation notes for a new engineer

- Treat `docs/` and `docs/snippets/` as the two primary content sources.
- Treat `lib/` as the shared rules layer for schemas, paths, and record building.
- Treat `plugins/` as build-time systems only; they run in Node and should not contain browser UI.
- Treat `src/components/` and `src/theme/` as the client/UI layer.
- Keep global data small. Large searchable corpora belong in route-specific generated data, not on every page.
- If a feature affects both snippets and search, prefer adding shared logic to `lib/` instead of duplicating it in both plugins.

---

## Relevant documentation

### Docusaurus

- [Introduction](https://docusaurus.io/docs/)
- [Architecture](https://docusaurus.io/docs/advanced/architecture)
- [Docs plugin (`@docusaurus/plugin-content-docs`)](https://docusaurus.io/docs/api/plugins/%40docusaurus/plugin-content-docs)
- [MDX and React](https://docusaurus.io/docs/markdown-features/react)
- [Swizzling](https://docusaurus.io/docs/swizzling/)
- [Plugin lifecycle APIs](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis)
- [Plugins overview](https://docusaurus.io/docs/advanced/plugins)
- [Styling and Layout](https://docusaurus.io/docs/styling-layout/)
- [Static Assets](https://docusaurus.io/docs/static-assets)

### Lunr

- [Getting Started](https://lunrjs.com/guides/getting_started.html)
- [Pre-building Indexes](https://lunrjs.com/guides/index_prebuilding.html)
- [`lunr.Builder`](https://lunrjs.com/docs/lunr.Builder.html)
- [`lunr.Index`](https://lunrjs.com/docs/lunr.Index.html)

