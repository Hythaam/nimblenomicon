export interface RankedResult {
  ref: string;
  score: number;
  type: 'snippet' | 'doc';
}

export function rankResults(
  snippetMatches: Array<{ ref: string; score: number }>,
  docMatches: Array<{ ref: string; score: number }>
): { snippets: RankedResult[]; docs: RankedResult[] } {
  const snippets = snippetMatches
    .map(m => ({ ...m, type: 'snippet' as const }))
    .sort((a, b) => b.score - a.score);
  const docs = docMatches
    .map(m => ({ ...m, type: 'doc' as const }))
    .sort((a, b) => b.score - a.score);
  return { snippets, docs };
}
