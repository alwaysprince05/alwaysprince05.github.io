import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from './Icons';
import { LINKS, scrollToId, toggleTheme } from '../lib';

interface Cmd {
  g: string;
  t: string;
  k: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCopyEmail: () => void;
}

const openTab = (url: string) => window.open(url, '_blank', 'noopener');

export default function CommandPalette({ open, onClose, onCopyEmail }: Props) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const cmds = useMemo<Cmd[]>(() => {
    const go = (id: string) => () => {
      onClose();
      scrollToId(id);
    };
    return [
      { g: 'Go to', t: 'Open source work', k: '01', run: go('work') },
      { g: 'Go to', t: 'Case study: DuckDB #25232', k: '02', run: go('case') },
      { g: 'Go to', t: 'Projects', k: '03', run: go('projects') },
      { g: 'Go to', t: 'Experience & skills', k: '04', run: go('about') },
      { g: 'Go to', t: 'Contact', k: '05', run: go('contact') },
      { g: 'Actions', t: 'Copy email address', k: 'copy', run: () => { go('contact')(); onCopyEmail(); } },
      { g: 'Actions', t: 'Toggle light / dark theme', k: 'theme', run: toggleTheme },
      { g: 'Links', t: 'Open GitHub profile', k: '↗', run: () => openTab(LINKS.github) },
      { g: 'Links', t: 'Open LinkedIn', k: '↗', run: () => openTab(LINKS.linkedin) },
      { g: 'Links', t: 'Open LeetCode', k: '↗', run: () => openTab(LINKS.leetcode) },
    ];
  }, [onClose, onCopyEmail]);

  const visible = cmds.filter((c) => !q.trim() || c.t.toLowerCase().includes(q.trim().toLowerCase()));

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => input.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, visible.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter' && visible[sel]) {
        e.preventDefault();
        visible[sel].run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, visible, sel, onClose]);

  if (!open) return null;

  let lastGroup = '';
  return (
    <div className="cmdk open" role="dialog" aria-modal="true" aria-label="Command menu" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk-box">
        <div className="cmdk-in">
          <Search />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a section or run an action…"
            autoComplete="off"
            aria-label="Command"
          />
          <kbd>esc</kbd>
        </div>
        <div className="cmdk-list">
          {visible.length === 0 && <div className="empty">Nothing found.</div>}
          {visible.map((c, i) => {
            const header = c.g !== lastGroup ? <div className="cmdk-g">{c.g}</div> : null;
            lastGroup = c.g;
            return (
              <div key={c.t}>
                {header}
                <div className={`cmdk-item${i === sel ? ' sel' : ''}`} onMouseMove={() => setSel(i)} onClick={c.run}>
                  <span>{c.t}</span>
                  <span>{c.k}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
