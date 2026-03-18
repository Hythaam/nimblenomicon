import React from 'react';
import styles from './SearchInput.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search rules, conditions, spells…' }: Props) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} aria-hidden>🔍</span>
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        aria-label="Search"
      />
    </div>
  );
}
