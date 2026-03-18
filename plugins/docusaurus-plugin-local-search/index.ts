import type { LoadContext, Plugin } from '@docusaurus/types';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lunr = require('lunr') as typeof import('lunr');
import { loadAllSnippets } from '../../lib/reference/loadSnippets';
import { buildSnippetRecords } from '../../lib/search/buildSnippetRecords';
import type { DocSearchRecord } from '../../lib/search/buildDocsRecords';

/** Strip MDX/markdown syntax to get plain-text body for indexing. */
function extractText(source: string): string {
  return source
    .replace(/^---[\s\S]*?---/m, '')          // frontmatter
    .replace(/<[^>]+>/g, ' ')                  // JSX/HTML tags
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // markdown links → label
    .replace(/[#*`_~>|]/g, ' ')               // markdown syntax chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

/** Extract heading text from MDX source. */
function extractHeadings(source: string): string {
  return (source.match(/^#+\s+(.+)$/gm) ?? [])
    .map(h => h.replace(/^#+\s+/, ''))
    .join(' ');
}

/** Extract `title:` from frontmatter, falling back to first H1. */
function extractTitle(source: string): string {
  const fm = source.match(/^---[\s\S]*?^title:\s*(.+)/m);
  if (fm) return fm[1].trim().replace(/^['"]|['"]$/g, '');
  const h1 = source.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : 'Untitled';
}

/** Recursively walk docs dir, skip snippets/, return DocSearchRecord[]. */
function walkDocs(dir: string, siteDocsDir: string = dir): DocSearchRecord[] {
  const records: DocSearchRecord[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'snippets') continue;   // excluded from docs routes
      records.push(...walkDocs(fullPath, siteDocsDir));
    } else if (entry.name.match(/\.(mdx?|md)$/)) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const title = extractTitle(raw);
      const body = extractText(raw);
      const headings = extractHeadings(raw);

      // Derive URL from relative path: docs/rules/combat.mdx → /rules/combat
      const rel = path.relative(siteDocsDir, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.(mdx?|md)$/, '');
      // index files become the parent path
      const urlPath = rel === 'index' ? '/' : '/' + rel.replace(/\/index$/, '');

      // Breadcrumbs from path segments excluding the last (the page itself)
      const parts = urlPath.split('/').filter(Boolean);
      const breadcrumbs = parts.slice(0, -1)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' › ');

      const id = rel.replace(/\//g, '__');

      records.push({ id, title, url: urlPath, breadcrumbs, body, headings });
    }
  }
  return records;
}

export default function pluginLocalSearch(context: LoadContext): Plugin<void> {
  const snippetsDir = path.join(context.siteDir, 'docs', 'snippets');

  return {
    name: 'docusaurus-plugin-local-search',

    async contentLoaded({ actions }) {
      const { addRoute, createData } = actions;

      // ── Snippet index ────────────────────────────────────────────────────
      const snippets = loadAllSnippets(snippetsDir);
      const snippetRecords = buildSnippetRecords(snippets);

      const snippetIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('aliases', { boost: 7 });
        this.field('summary', { boost: 5 });
        this.field('tags', { boost: 3 });
        this.field('body', { boost: 2 });
        snippetRecords.forEach(r => this.add(r));
      });

      const snippetsIndexPath = await createData(
        'snippets-index.json',
        JSON.stringify(snippetIndex.toJSON())
      );
      const snippetsStorePath = await createData(
        'snippets-store.json',
        JSON.stringify(snippetRecords)
      );

      // ── Docs index ───────────────────────────────────────────────────────
      // Walk docs/ and index all MDX/MD files directly from the filesystem.
      const docsDir = path.join(context.siteDir, 'docs');
      const docRecords: DocSearchRecord[] = walkDocs(docsDir);

      const docsIndex = lunr(function () {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('headings', { boost: 6 });
        this.field('body', { boost: 3 });
        docRecords.forEach(r => this.add(r));
      });

      const docsIndexPath = await createData(
        'docs-index.json',
        JSON.stringify(docsIndex.toJSON())
      );
      const docsStorePath = await createData(
        'docs-store.json',
        JSON.stringify(docRecords)
      );

      // ── /search route ────────────────────────────────────────────────────
      addRoute({
        path: '/search',
        component: '@site/src/components/search/SearchPage',
        exact: true,
        modules: {
          snippetsIndex: snippetsIndexPath,
          snippetsStore: snippetsStorePath,
          docsIndex: docsIndexPath,
          docsStore: docsStorePath,
        },
      });
    },
  };
}
