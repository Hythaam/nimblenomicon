import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useHistory } from '@docusaurus/router';
import styles from './SearchModal.module.css';
import { rankResults } from '../../../lib/search/rankResults';
import type { SnippetSearchRecord } from '../../../lib/search/buildSnippetRecords';
import type { DocSearchRecord } from '../../../lib/search/buildDocsRecords';

// lunr is loaded client-side only
let lunr: typeof import('lunr') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  lunr = require('lunr');
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snippetsIndex: object;
  snippetsStore: SnippetSearchRecord[];
  docsIndex: object;
  docsStore: DocSearchRecord[];
}

interface ResultItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  summary?: string;
  breadcrumbs?: string;
  body?: string;
}

const MAX_RESULTS = 10;
const DEBOUNCE_MS = 100;

export default function SearchModal({
  isOpen,
  onClose,
  snippetsIndex,
  snippetsStore,
  docsIndex,
  docsStore,
}: Props) {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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

  const results = useMemo(() => {
    if (!query.trim() || !lunr) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snipIdx = (lunr as any).Index.load(snippetsIndex);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docIdx = (lunr as any).Index.load(docsIndex);

    let snipMatches: Array<{ ref: string; score: number }> = [];
    let docMatches: Array<{ ref: string; score: number }> = [];

    try { snipMatches = snipIdx.search(query); } catch { /* ignore parse errors */ }
    try { docMatches = docIdx.search(query); } catch { /* ignore parse errors */ }

    const { snippets: rankedSnips, docs: rankedDocs } = rankResults(snipMatches, docMatches);

    const combined: ResultItem[] = [];

    rankedSnips
      .slice(0, MAX_RESULTS)
      .forEach(m => {
        const r = snippetStoreMap[m.ref];
        if (r) {
          combined.push({
            id: r.id,
            title: r.title,
            url: r.url,
            category: r.category,
            summary: r.summary,
          });
        }
      });

    rankedDocs
      .slice(0, MAX_RESULTS)
      .forEach(m => {
        const r = docStoreMap[m.ref];
        if (r) {
          combined.push({
            id: r.id,
            title: r.title,
            url: r.url,
            breadcrumbs: r.breadcrumbs,
            body: r.body?.slice(0, 150),
          });
        }
      });

    return combined.slice(0, MAX_RESULTS);
  }, [query, snippetsIndex, docsIndex, snippetStoreMap, docStoreMap]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);
  };

  const handleSelectResult = useCallback(
    (url: string) => {
      history.push(url.replace('//', '/'));
      setQuery('');
      onClose();
    },
    [history, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          handleSelectResult(results[selectedIndex].url);
        }
        break;
      default:
        break;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const truncateText = (text: string | undefined, maxLength: number = 150): string => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.inputWrapper}>
            <span className={styles.icon}>🔍</span>
            <input
              ref={inputRef}
              type="search"
              className={styles.input}
              placeholder="Search rules, conditions, spells…"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              aria-label="Search"
            />
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close search"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className={styles.resultsContainer} ref={resultsRef}>
          {!query ? (
            <div className={styles.emptyState}>
              <p>Start typing to search the rules.</p>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                No results for <strong>{query}</strong>.
              </p>
            </div>
          ) : (
            <ul className={styles.resultsList}>
              {results.map((result, idx) => (
                <li key={result.id}>
                  <button
                    className={`${styles.resultItem} ${
                      idx === selectedIndex ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectResult(result.url)}
                    type="button"
                  >
                    <div className={styles.resultTitle}>{result.title}</div>
                    {result.breadcrumbs && (
                      <div className={styles.breadcrumbs}>{result.breadcrumbs}</div>
                    )}
                    {result.category && (
                      <div className={styles.category}>{result.category}</div>
                    )}
                    {result.summary && (
                      <div className={styles.summary}>{truncateText(result.summary)}</div>
                    )}
                    {result.body && (
                      <div className={styles.preview}>{truncateText(result.body)}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
