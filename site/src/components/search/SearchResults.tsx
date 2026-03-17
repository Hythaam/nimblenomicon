import React from 'react';
import ResultGroup, { type ResultItem } from './ResultGroup';

interface Props {
  snippetResults: ResultItem[];
  docResults: ResultItem[];
  query: string;
}

export default function SearchResults({ snippetResults, docResults, query }: Props) {
  const total = snippetResults.length + docResults.length;
  if (!query) return <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>Start typing to search the rules.</p>;
  if (total === 0) return <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>No results for &quot;<strong>{query}</strong>&quot;.</p>;
  return (
    <div>
      <ResultGroup heading={`Snippets (${snippetResults.length})`} items={snippetResults} type="snippet" />
      <ResultGroup heading={`Documentation (${docResults.length})`} items={docResults} type="doc" />
    </div>
  );
}
