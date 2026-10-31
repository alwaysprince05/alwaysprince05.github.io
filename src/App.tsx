import { useCallback, useEffect, useState } from 'react';
import Nav from './components/Nav';
import Bento from './components/Bento';
import CommandPalette from './components/CommandPalette';
import { About, CaseStudy, Contact, Footer, Hero, Projects, Work } from './components/Sections';
import { useCopyEmail, useRevealAll } from './lib';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { copied, copy } = useCopyEmail();
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useRevealAll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === '/' && !paletteOpen && !(document.activeElement instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById('q')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  return (
    <>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <main id="top">
        <div className="hero">
          <Hero />
          <Bento />
        </div>
        <Work />
        <CaseStudy />
        <Projects />
        <About />
        <Contact copied={copied} onCopy={copy} />
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={closePalette} onCopyEmail={copy} />
    </>
  );
}
