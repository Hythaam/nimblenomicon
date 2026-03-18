export interface ExternalLink {
  label: string;
  path: string;
}

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
  externalLinks?: ExternalLink[];
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
  if (d.externalLinks !== undefined) {
    if (!Array.isArray(d.externalLinks)) throw new Error(`Snippet ${d.id}: externalLinks must be array`);
    for (const link of d.externalLinks as unknown[]) {
      const l = link as Record<string, unknown>;
      if (typeof l.label !== 'string') throw new Error(`Snippet ${d.id}: externalLink missing label`);
      if (typeof l.path !== 'string') throw new Error(`Snippet ${d.id}: externalLink missing path`);
    }
  }
  return d as unknown as SnippetRecord;
}
