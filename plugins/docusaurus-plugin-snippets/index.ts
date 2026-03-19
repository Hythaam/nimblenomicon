import type { LoadContext, Plugin } from '@docusaurus/types';
import * as path from 'path';
import { loadAllSnippets } from '../../lib/reference/loadSnippets';
import { buildTooltipRegistry } from '../../lib/reference/tooltipRegistry';
import type { SnippetRecord } from '../../lib/reference/schema';
import { snippetPath } from '../../lib/reference/paths';

export default function pluginSnippets(context: LoadContext): Plugin<SnippetRecord[]> {
  const snippetsDir = path.join(context.siteDir, 'docs', 'snippets');
  const baseUrl = context.siteConfig.baseUrl || '';

  return {
    name: 'docusaurus-plugin-snippets',

    async loadContent() {
      return loadAllSnippets(snippetsDir);
    },

    async contentLoaded({ content: snippets, actions }) {
      const { addRoute, createData, setGlobalData } = actions;

      const registry = buildTooltipRegistry(snippets, baseUrl);
      setGlobalData({ tooltipRegistry: registry });

      for (const snippet of snippets) {
        const dataPath = await createData(
          `snippet-${snippet.id}.json`,
          JSON.stringify(snippet)
        );
        addRoute({
          path: snippetPath(snippet, baseUrl),
          component: '@site/src/components/reference/SnippetPage',
          exact: true,
          modules: {
            snippet: dataPath,
          },
        });
      }
    },
  };
}
