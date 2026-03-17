export interface SnippetRecord {
  id: string;
  category: 'condition' | 'action' | 'keyword' | 'trait';
  title: string;
  aliases: string[];
  tags: string[];
  summary: string;
  tooltipBody: string;
  body: string;
  relatedIds: string[];
}

export type TooltipEntry = Pick<SnippetRecord, 'id' | 'title' | 'category' | 'summary' | 'tooltipBody'> & { url: string };

export function validateSnippet(data: unknown): SnippetRecord {
  const d = data as Record<string, unknown>;
  if (typeof d.id !== 'string') throw new Error(`Snippet missing id: ${JSON.stringify(d)}`);
  if (typeof d.category !== 'string') throw new Error(`Snippet ${d.id} missing category`);
  if (typeof d.title !== 'string') throw new Error(`Snippet ${d.id} missing title`);
  if (!Array.isArray(d.aliases)) throw new Error(`Snippet ${d.id}: aliases must be array`);
  if (!Array.isArray(d.tags)) throw new Error(`Snippet ${d.id}: tags must be array`);
  if (typeof d.summary !== 'string') throw new Error(`Snippet ${d.id} missing summary`);
  if (typeof d.tooltipBody !== 'string') throw new Error(`Snippet ${d.id} missing tooltipBody`);
  if (typeof d.body !== 'string') throw new Error(`Snippet ${d.id} missing body`);
  if (!Array.isArray(d.relatedIds)) throw new Error(`Snippet ${d.id}: relatedIds must be array`);
  return d as unknown as SnippetRecord;
}
