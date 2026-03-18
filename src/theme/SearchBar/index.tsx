import React, { useState, useEffect } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import SearchModal from '../../components/search/SearchModal';
import styles from './styles.module.css';

interface PluginData {
  snippetsIndex: object;
  snippetsStore: unknown[];
  docsIndex: object;
  docsStore: unknown[];
}

export default function SearchBar(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pluginData = usePluginData('docusaurus-plugin-local-search') as PluginData | undefined;

  // Add keyboard shortcut support (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={styles.form} role="search">
        <input
          type="search"
          className={styles.input}
          placeholder="Search rules…"
          aria-label="Search"
          onClick={handleInputClick}
          readOnly
          title="Click to search or press Ctrl+K"
        />
        <button
          type="button"
          className={styles.button}
          aria-label="Open search"
          onClick={() => setIsModalOpen(true)}
        >
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
      </div>
      {pluginData && (
        <SearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          snippetsIndex={pluginData.snippetsIndex}
          snippetsStore={pluginData.snippetsStore as any}
          docsIndex={pluginData.docsIndex}
          docsStore={pluginData.docsStore as any}
        />
      )}
    </>
  );
}
