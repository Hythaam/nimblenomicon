import React from 'react';
import styles from './StatBlock.module.css';

interface StatEntry {
  label: string;
  value: string | number;
}

interface Props {
  name: string;
  stats: StatEntry[];
  description?: string;
}

export default function StatBlock({ name, stats, description }: Props) {
  return (
    <div className={styles.statBlock}>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.stats}>
        {stats.map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.value}>{s.value}</span>
          </div>
        ))}
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
