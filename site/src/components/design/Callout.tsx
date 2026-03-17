import React from 'react';
import styles from './Callout.module.css';

type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'info';

interface Props {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export default function Callout({ type = 'note', title, children }: Props) {
  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
