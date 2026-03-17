import React from 'react';
import styles from './SnippetLink.module.css';
import type { TooltipEntry } from '../../../lib/reference/schema';

interface Props {
  entry: TooltipEntry;
  children?: React.ReactNode;
}

export default function SnippetLink({ entry, children }: Props) {
  return (
    <a href={entry.url} className={styles.link}>
      {children ?? entry.title}
    </a>
  );
}
