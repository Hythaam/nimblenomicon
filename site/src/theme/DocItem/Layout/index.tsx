import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type { Props } from '@theme/DocItem/Layout';
import styles from './styles.module.css';

export default function DocItemLayoutWrapper(props: Props): JSX.Element {
  return (
    <div className={styles.docWrapper}>
      <DocItemLayout {...props} />
    </div>
  );
}
