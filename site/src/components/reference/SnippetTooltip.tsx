import React, { useState, useRef, useEffect, useCallback } from 'react';
import CategoryBadge from '../design/CategoryBadge';
import styles from './SnippetTooltip.module.css';
import type { TooltipEntry } from '../../../lib/reference/schema';

interface Props {
  entry: TooltipEntry;
  children: React.ReactNode;
}

export default function SnippetTooltip({ entry, children }: Props) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const hide = useCallback(() => setVisible(false), []);
  const show = useCallback(() => setVisible(true), []);

  // Keyboard: Escape closes the tooltip
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, hide]);

  // Outside-click closes the tooltip (important for mobile tap-to-open)
  useEffect(() => {
    if (!visible) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        hide();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [visible, hide]);

  function handleClick(e: React.MouseEvent) {
    // On touch/mobile: toggle tooltip. On desktop: clicks fall through to the link.
    // Only toggle if the click target is the container itself (not the "Open full entry" link).
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') return;
    e.preventDefault();
    setVisible(v => !v);
  }

  return (
    <span
      ref={containerRef}
      className={styles.container}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={handleClick}
    >
      {children}
      {visible && (
        <span className={styles.tooltip} role="tooltip" aria-live="polite">
          <span className={styles.header}>
            <span className={styles.title}>{entry.title}</span>
            <CategoryBadge category={entry.category} />
          </span>
          <span className={styles.body}>{entry.tooltipBody}</span>
          <a href={entry.url} className={styles.fullLink}>
            Open full entry →
          </a>
        </span>
      )}
    </span>
  );
}
