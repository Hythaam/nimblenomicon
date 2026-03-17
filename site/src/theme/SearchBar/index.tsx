import React from 'react';
import { useHistory } from '@docusaurus/router';
import styles from './styles.module.css';

export default function SearchBar(): JSX.Element {
  const history = useHistory();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim();
    if (q) {
      history.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      history.push('/search');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <input
        name="q"
        type="search"
        className={styles.input}
        placeholder="Search rules…"
        aria-label="Search"
      />
      <button type="submit" className={styles.button} aria-label="Submit search">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}
