import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DATA } from '../data';
import { prefersReducedMotion, spotlight, useInView } from '../lib';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = 864e5;
const fmt = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
const level = (n: number) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4);

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setN(to);
      return;
    }
    let raf = 0;
    let t0: number | null = null;
    const step = (t: number) => {
      t0 ??= t;
      const k = Math.min((t - t0) / 1200, 1);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{n}</>;
}

function Heatmap() {
  const { cal } = DATA;
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const start = new Date(`${cal.start}T00:00:00Z`).getTime();
  const totalWeeks = Math.ceil(cal.counts.length / 7);
  const weeks = width < 520 ? 22 : width < 760 ? 36 : totalWeeks;
  const firstIdx = (totalWeeks - weeks) * 7;
  const first = new Date(start + firstIdx * DAY);
  const last = new Date(start + (cal.counts.length - 1) * DAY);

  const cells = [];
  const months = [];
  let lastM = -1;
  for (let i = firstIdx; i < cal.counts.length; i++) {
    const d = new Date(start + i * DAY);
    const n = cal.counts[i];
    cells.push(<span key={i} data-l={level(n)} data-t={`${n} contribution${n === 1 ? '' : 's'} · ${fmt(d)}`} />);
    if ((i - firstIdx) % 7 === 0) {
      const m = d.getUTCMonth();
      months.push(<span key={i}>{m !== lastM && d.getUTCDate() <= 7 ? MON[m] : ''}</span>);
      lastM = m;
    }
  }

  const onOver = (e: React.MouseEvent) => {
    const t = (e.target as HTMLElement).getAttribute('data-t');
    if (!t || !wrap.current) return;
    const r = (e.target as HTMLElement).getBoundingClientRect();
    const pr = wrap.current.getBoundingClientRect();
    setTip({ text: t, x: Math.min(Math.max(r.left - pr.left + r.width / 2, 90), pr.width - 90), y: r.top - pr.top });
  };

  const cols = { gridTemplateColumns: `repeat(${weeks}, 1fr)` };
  return (
    <div className="tile spot t-heat rv" onPointerMove={spotlight}>
      <div className="tile-h">
        <span className="label">GitHub activity · last 12 months</span>
        <span className="label">
          {MON[first.getUTCMonth()]} {first.getUTCFullYear()} – {MON[last.getUTCMonth()]} {last.getUTCFullYear()}
        </span>
      </div>
      <div className="heat-wrap" ref={wrap}>
        <div className="heat-months" style={cols}>{months}</div>
        <div className="heat" style={cols} role="img" aria-label="GitHub contribution calendar" onMouseOver={onOver} onMouseLeave={() => setTip(null)}>
          {cells}
        </div>
        <div className="heat-tip" style={tip ? { left: tip.x, top: tip.y, opacity: 1 } : undefined}>{tip?.text}</div>
      </div>
      <div className="heat-foot">
        <span>
          <b>{cal.total.toLocaleString('en-US')}</b> contributions on <b>{cal.counts.filter((n) => n > 0).length}</b> days
        </span>
        <span className="legend">
          less <span style={{ background: 'var(--heat-0)' }} />
          <span style={{ background: 'color-mix(in srgb,var(--accent) 28%,transparent)' }} />
          <span style={{ background: 'color-mix(in srgb,var(--accent) 50%,transparent)' }} />
          <span style={{ background: 'color-mix(in srgb,var(--accent) 75%,transparent)' }} />
          <span style={{ background: 'var(--accent)' }} /> more
        </span>
      </div>
    </div>
  );
}

function Stats() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const repos = new Set(DATA.prs.map((p) => p[4])).size;
  const by = (k: string) => DATA.prs.filter((p) => p[1] === k).length;
  return (
    <div ref={ref} className="tile spot t-stats rv d1" onPointerMove={spotlight}>
      <span className="label">Merged upstream</span>
      <div className="big-stat" style={{ marginTop: 14 }}>
        <span className="n"><CountUp to={DATA.prs.length} run={inView} /></span>
        <span className="serif">pull requests</span>
      </div>
      <p>Across {repos} repositories. Most are bug fixes that ship with a regression test.</p>
      <div className="mini-stats">
        <div><b><CountUp to={by('stdexec')} run={inView} /></b><span>NVIDIA stdexec</span></div>
        <div><b><CountUp to={by('hpx')} run={inView} /></b><span>HPX runtime</span></div>
        <div><b><CountUp to={by('duckdb')} run={inView} /></b><span>DuckDB</span></div>
      </div>
    </div>
  );
}

function Terminal() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const lines = DATA.prs.slice(0, 6);
  const repos = new Set(DATA.prs.map((p) => p[4])).size;

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(lines.length + 1);
      return;
    }
    const timers = Array.from({ length: lines.length + 1 }, (_, i) => setTimeout(() => setShown(i + 1), 250 + i * 170));
    return () => timers.forEach(clearTimeout);
  }, [inView, lines.length]);

  return (
    <div ref={ref} className="tile t-term rv">
      <div className="term-bar"><i /><i /><i /><span>~/open-source — zsh</span></div>
      <div className="term-body">
        <div className="cmd"><b>❯</b> gh search prs --author alwaysprince05 --merged</div>
        {lines.map((p, i) => (
          <div key={p[2]} className={`tl${i < shown ? ' on' : ''}`}>
            <span className="r">{p[1]}#{p[2]}</span>
            <span className="m">{p[3]}</span>
          </div>
        ))}
        <div className="term-foot" style={{ opacity: shown > lines.length ? 1 : 0 }}>
          {DATA.prs.length} merged · {repos} repositories<span className="caret" />
        </div>
      </div>
    </div>
  );
}

function InReview() {
  return (
    <div className="tile spot t-review rv d1" onPointerMove={spotlight}>
      <div className="tile-h">
        <span className="label">In review right now</span>
        <span className="count-pill">{DATA.open.length} open</span>
      </div>
      <div className="review-list">
        {DATA.open.slice(0, 4).map((p) => (
          <a key={`${p[3]}#${p[1]}`} href={`https://github.com/${p[3]}/pull/${p[1]}`} target="_blank" rel="noopener">
            <span className="dot" />
            <span>
              <span className="tt">{p[2]}</span>
              <span className="rp">{p[3]} #{p[1]}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Now() {
  const [time, setTime] = useState('--:--');
  useEffect(() => {
    const tick = () => {
      try {
        setTime(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()));
      } catch {
        /* Intl time zones unsupported */
      }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="tile spot t-now rv d2" onPointerMove={spotlight}>
      <span className="label">Local time</span>
      <div className="clock" style={{ marginTop: 14 }}>{time}<small>IST</small></div>
      <div className="place">Bengaluru, India</div>
      <div className="now-box">
        <span className="label">Currently</span>
        <b>Debugging a thread-count bug in HPX's scheduler</b>
        <a href="https://github.com/TheHPXProject/hpx/issues/7943" target="_blank" rel="noopener">hpx#7943 ↗</a>
      </div>
    </div>
  );
}

export default function Bento() {
  return (
    <div className="wrap">
      <div className="bento">
        <Heatmap />
        <Stats />
        <Terminal />
        <InReview />
        <Now />
      </div>
    </div>
  );
}
