import type { SnippetRecord } from './schema';

export function snippetPath(snippet: Pick<SnippetRecord, 'id' | 'category'>): string {
  return `/reference/${snippet.category}s/${snippet.id}`;
}
