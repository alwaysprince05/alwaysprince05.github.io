import { useEffect, useState } from 'react';
import { Menu, Moon, Sun } from './Icons';
import { toggleTheme } from '../lib';

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'case', label: 'Case study' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 10);
      setProgress(h > 0 ? (y / h) * 100 : 0);
      let cur = '';
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 160) cur = s.id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap">
          <a href="#top" className="brand" aria-label="Home">
            <span className="brand-mark">pm</span>Prince Maurya
          </a>
          <nav className={`nav-links${open ? ' open' : ''}`} id="links" aria-label="Main">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={() => setOpen(false)}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="nav-right">
            <button className="kbd-btn" onClick={onOpenPalette} aria-label="Open command menu">
              <span className="lbl">Quick jump</span>
              <kbd>⌘K</kbd>
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <Moon />
              <Sun />
            </button>
            <button
              className="icon-btn menu-btn"
              onClick={() => setOpen((o) => !o)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="links"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
