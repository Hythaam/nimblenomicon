import type { SnippetRecord } from './schema';

export function snippetPath(snippet: Pick<SnippetRecord, 'id' | 'category'>, baseUrl: string = ''): string {
  return `${baseUrl}reference/${snippet.category}s/${snippet.id}`;
}
