import type { SnippetRecord } from '../reference/schema';
import { snippetPath } from '../reference/paths';

export interface SnippetSearchRecord {
  id: string;
  title: string;
  category: string;
  url: string;
  summary: string;
  aliases: string;
  body: string;
  tags: string;
}

export function buildSnippetRecords(snippets: SnippetRecord[], baseUrl: string = ''): SnippetSearchRecord[] {
  return snippets.map(s => ({
    id: s.id,
    title: s.title,
    category: s.category,
    url: snippetPath(s, baseUrl),
    summary: s.summary,
    aliases: s.aliases.join(' '),
    body: s.body,
    tags: s.tags.join(' '),
  }));
}
