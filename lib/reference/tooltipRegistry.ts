import type { SnippetRecord, TooltipEntry } from './schema';
import { snippetPath } from './paths';

export function buildTooltipRegistry(snippets: SnippetRecord[]): Record<string, TooltipEntry> {
  const registry: Record<string, TooltipEntry> = {};
  for (const s of snippets) {
    const entry: TooltipEntry = {
      id: s.id,
      title: s.title,
      category: s.category,
      summary: s.summary,
      tooltipBody: s.tooltipBody,
      url: snippetPath(s),
    };
    registry[s.id] = entry;
    for (const alias of s.aliases) {
      const aliasKey = alias.toLowerCase().replace(/\s+/g, '-');
      if (!registry[aliasKey]) registry[aliasKey] = entry;
    }
  }
  return registry;
}
