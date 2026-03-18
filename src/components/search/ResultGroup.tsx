import React from 'react';
import CategoryBadge from '../design/CategoryBadge';
import styles from './ResultGroup.module.css';

export interface ResultItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  summary?: string;
  breadcrumbs?: string;
  body?: string;
}

interface Props {
  heading: string;
  items: ResultItem[];
  type: 'snippet' | 'doc';
}

export default function ResultGroup({ heading, items, type }: Props) {
  if (items.length === 0) return null;
  return (
    <div className={styles.group}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={styles.item}>
            <a href={item.url} className={styles.link}>
              <span className={styles.itemHeader}>
                <span className={styles.itemTitle}>{item.title}</span>
                {item.category && type === 'snippet' && (
                  <CategoryBadge category={item.category} />
                )}
              </span>
              {type === 'snippet' && item.summary && (
                <span className={styles.excerpt}>{item.summary}</span>
              )}
              {type === 'doc' && (
                <>
                  {item.breadcrumbs && <span className={styles.breadcrumbs}>{item.breadcrumbs}</span>}
                  {item.body && <span className={styles.excerpt}>{item.body.slice(0, 160)}…</span>}
                </>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
