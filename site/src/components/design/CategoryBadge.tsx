import React from 'react';
import styles from './CategoryBadge.module.css';

interface Props {
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  condition: 'Condition',
  action: 'Action',
  keyword: 'Keyword',
  trait: 'Trait',
};

export default function CategoryBadge({ category }: Props) {
  return (
    <span className={`${styles.badge} ${styles[category] || ''}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
