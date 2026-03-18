import React from 'react';
import Layout from '@theme/Layout';
import { usePluginData } from '@docusaurus/useGlobalData';
import CategoryBadge from '../design/CategoryBadge';
import styles from './SnippetPage.module.css';
import type { SnippetRecord, TooltipEntry } from '../../../lib/reference/schema';

interface Props {
  snippet: SnippetRecord;
}

interface PluginData {
  tooltipRegistry: Record<string, TooltipEntry>;
}

export default function SnippetPage({ snippet }: Props) {
  const data = usePluginData('docusaurus-plugin-snippets') as PluginData | undefined;
  const registry = data?.tooltipRegistry ?? {};

  return (
    <Layout title={snippet.title} description={snippet.summary}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{snippet.title}</h1>
          <CategoryBadge category={snippet.category} />
        </div>
        <p className={styles.summary}>{snippet.summary}</p>
        <div className={styles.body}>
          <p>{snippet.body}</p>
        </div>
        {snippet.relatedIds.length > 0 && (
          <div className={styles.related}>
            <h3>Related</h3>
            <ul>
              {snippet.relatedIds.map(id => {
                // Look up the related entry to get the correct canonical URL,
                // regardless of whether it lives in a different category.
                const related = registry[id];
                const url = related?.url ?? `/reference/${snippet.category}s/${id}`;
                const label = related?.title ?? id;
                return (
                  <li key={id}>
                    <a href={url}>{label}</a>
                    {related && (
                      <span className={styles.relatedCategory}>
                        <CategoryBadge category={related.category} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {snippet.externalLinks && snippet.externalLinks.length > 0 && (
          <div className={styles.related}>
            <h3>Learn More</h3>
            <ul>
              {snippet.externalLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.path}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
