import React, { useState, useMemo, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import styles from './SearchPage.module.css';
import { rankResults } from '../../../lib/search/rankResults';
import type { SnippetSearchRecord } from '../../../lib/search/buildSnippetRecords';
import type { DocSearchRecord } from '../../../lib/search/buildDocsRecords';
import type { ResultItem } from './ResultGroup';

// lunr is loaded client-side only
let lunr: typeof import('lunr') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  lunr = require('lunr');
}

interface Props {
  snippetsIndex: object;
  snippetsStore: SnippetSearchRecord[];
  docsIndex: object;
  docsStore: DocSearchRecord[];
}

export default function SearchPage({ snippetsIndex, snippetsStore, docsIndex, docsStore }: Props) {
  const location = useLocation();
  const initialQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') ?? '';
  }, [location.search]);

  const [query, setQuery] = useState(initialQuery);

  // Sync query when URL param changes (e.g., from the navbar SearchBar)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const snippetStoreMap = useMemo(() => {
    const m: Record<string, SnippetSearchRecord> = {};
    for (const r of snippetsStore) m[r.id] = r;
    return m;
  }, [snippetsStore]);

  const docStoreMap = useMemo(() => {
    const m: Record<string, DocSearchRecord> = {};
    for (const r of docsStore) m[r.id] = r;
    return m;
  }, [docsStore]);

  const { snippetResults, docResults } = useMemo(() => {
    if (!query.trim() || !lunr) return { snippetResults: [], docResults: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snipIdx = (lunr as any).Index.load(snippetsIndex);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docIdx = (lunr as any).Index.load(docsIndex);

    let snipMatches: Array<{ ref: string; score: number }> = [];
    let docMatches: Array<{ ref: string; score: number }> = [];

    try { snipMatches = snipIdx.search(query); } catch { /* ignore parse errors */ }
    try { docMatches = docIdx.search(query); } catch { /* ignore parse errors */ }

    // Use shared rankResults utility from lib/ to sort both result sets by score.
    const { snippets: rankedSnips, docs: rankedDocs } = rankResults(snipMatches, docMatches);

    const snippetResults: ResultItem[] = rankedSnips
      .map(m => {
        const r = snippetStoreMap[m.ref];
        if (!r) return null;
        return { id: r.id, title: r.title, url: r.url, category: r.category, summary: r.summary };
      })
      .filter(Boolean) as ResultItem[];

    const docResults: ResultItem[] = rankedDocs
      .map(m => {
        const r = docStoreMap[m.ref];
        if (!r) return null;
        return { id: r.id, title: r.title, url: r.url, breadcrumbs: r.breadcrumbs, body: r.body };
      })
      .filter(Boolean) as ResultItem[];

    return { snippetResults, docResults };
  }, [query, snippetsIndex, docsIndex, snippetStoreMap, docStoreMap]);

  return (
    <Layout title="Search" description="Search the Nimblenomicon rules reference">
      <div className={styles.page}>
        <h1 className={styles.heading}>Search Rules</h1>
        <SearchInput value={query} onChange={setQuery} />
        <div className={styles.results}>
          <SearchResults snippetResults={snippetResults} docResults={docResults} query={query} />
        </div>
      </div>
    </Layout>
  );
}
