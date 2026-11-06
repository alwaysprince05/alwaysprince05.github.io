import { useEffect, useRef, useState } from 'react';

export const LINKS = {
  github: 'https://github.com/alwaysprince05',
  linkedin: 'https://www.linkedin.com/in/prince-kumar-maurya-67a41128b/',
  leetcode: 'https://leetcode.com/u/alwaysprince05/',
  source: 'https://github.com/alwaysprince05/alwaysprince05.github.io',
  email: 'prince.p24@medhaviskillsuniversity.edu.in',
};

const REPO: Record<string, { name: string; c: string }> = {
  stdexec: { name: 'NVIDIA stdexec', c: '#76b900' },
  hpx: { name: 'HPX', c: '#5b8def' },
  duckdb: { name: 'DuckDB', c: '#fff000' },
  clickhouse: { name: 'ClickHouse', c: '#faff69' },
  tensorflow: { name: 'TensorFlow', c: '#ff8f00' },
  pytorch: { name: 'PyTorch', c: '#ee4c2c' },
  docker_build_env: { name: 'STEllAR docker_build_env', c: '#9b8cff' },
  nemo: { name: 'NVIDIA NeMo', c: '#76b900' },
  keras: { name: 'Keras', c: '#d00000' },
  openshift: { name: 'OpenShift', c: '#ee0000' },
  hami: { name: 'HAMi-core', c: '#00b4d8' },
};

export const repoName = (k: string) => REPO[k]?.name ?? k;
export const repoColor = (k: string) => REPO[k]?.c ?? '#888';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage unavailable */
  }
}

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** Adds `.in` to every `.rv` element as it enters the viewport. */
export function useRevealAll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.rv'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(LINKS.email).then(done, () => (location.href = `mailto:${LINKS.email}`));
    } else {
      location.href = `mailto:${LINKS.email}`;
    }
  };
  return { copied, copy };
}

/** Spotlight hover effect: tracks the pointer inside `.spot` tiles. */
export function spotlight(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}
