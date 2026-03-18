import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import SnippetTooltip from './SnippetTooltip';
import SnippetLink from './SnippetLink';
import type { TooltipEntry } from '../../../lib/reference/schema';

interface Props {
  id: string;
  label?: string;
}

interface PluginData {
  tooltipRegistry: Record<string, TooltipEntry>;
}

export default function RuleRef({ id, label }: Props) {
  const data = usePluginData('docusaurus-plugin-snippets') as PluginData | undefined;
  const registry = data?.tooltipRegistry ?? {};
  const entry = registry[id] ?? registry[id.toLowerCase()];

  if (!entry) {
    return <span title={`Unknown rule: ${id}`} style={{ color: 'var(--ifm-color-danger)', borderBottom: '1px dashed' }}>{label ?? id}</span>;
  }

  const displayLabel = label ?? entry.title;

  return (
    <SnippetTooltip entry={entry}>
      <SnippetLink entry={entry}>{displayLabel}</SnippetLink>
    </SnippetTooltip>
  );
}
