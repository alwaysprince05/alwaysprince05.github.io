import { useMemo, useState, type ReactNode } from 'react';
import { DATA, numberWords } from '../data';
import { LINKS, repoColor, repoName, spotlight } from '../lib';
import { ArrowDown, ArrowUpRight, Code, Copy, GitHub, LeetCode, LinkedIn, Search } from './Icons';

const ext = { target: '_blank', rel: 'noopener' } as const;

/* ---------- Hero ---------- */

const TICKER: Record<string, [string, string]> = {
  stdexec: ['NVIDIA', 'stdexec'], hpx: ['HPX', 'parallel runtime'], duckdb: ['DuckDB', 'query engine'],
  pytorch: ['PyTorch', 'TorchElastic'], tensorflow: ['TensorFlow', 'XLA'], docker_build_env: ['STEllAR Group', 'build env'],
  clickhouse: ['ClickHouse', 'analytics DB'], nemo: ['NVIDIA', 'NeMo Agent Toolkit'], hami: ['HAMi', 'GPU sharing'],
};

const merged: Record<string, number> = {};
DATA.prs.forEach((p) => (merged[p[1]] = (merged[p[1]] ?? 0) + 1));
const MARQUEE: [string, string, number][] = Object.keys(merged)
  .sort((a, b) => merged[b] - merged[a])
  .map((k) => [...(TICKER[k] ?? [repoName(k), '']), merged[k]]);

export function Hero() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <>
      <div className="hero-glow" />
      <div className="wrap">
        <div className="intro rv">
          <div className="avatar">pm</div>
          <div className="intro-name">Prince Kumar Maurya<span>Backend &amp; Systems · Bengaluru</span></div>
          <span className="status"><span className="pulse" />Open to SWE internships</span>
        </div>
        <h1 className="display rv d1">Backend engineer. Open-source <span className="serif">bug hunter.</span></h1>
        <div className="hero-sub">
          <p className="rv d2">
            I build <b>Java game-backend services</b> that stay correct when Kafka delivers twice, and I fix <b>C++ bugs</b> in
            the systems other engineers depend on: async runtimes, parallel schedulers, query engines. B.Tech CSE '28, Medhavi
            Skills University.
          </p>
          <div className="cta rv d3">
            <a className="btn solid" href="#work">See the work <ArrowDown /></a>
            <a className="btn" href={LINKS.github} {...ext}>GitHub <ArrowUpRight className="arr" /></a>
            <a className="btn" href={LINKS.linkedin} {...ext}>LinkedIn <ArrowUpRight className="arr" /></a>
          </div>
        </div>
      </div>
      <div className="marquee rv d4" aria-label="Projects contributed to">
        <div className="marquee-track">
          {items.map((m, i) => (
            <div className="marquee-item" key={i} aria-hidden={i >= MARQUEE.length}>
              <i /><b>{m[0]}</b>{m[1]}<span className="mono">{m[2]} merged</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Work (PR explorer) ---------- */

const LIMIT = 10;

export function Work() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const { counts, order } = useMemo(() => {
    const c: Record<string, number> = {};
    DATA.prs.forEach((p) => (c[p[1]] = (c[p[1]] ?? 0) + 1));
    return { counts: c, order: Object.keys(c).sort((a, b) => c[b] - c[a]) };
  }, []);

  const q = query.trim().toLowerCase();
  const rows = DATA.prs.filter(
    (p) => (filter === 'all' || p[1] === filter) && (!q || `${p[3]} ${p[1]} ${p[2]}`.toLowerCase().includes(q)),
  );
  const shown = expanded ? rows : rows.slice(0, LIMIT);

  const pick = (k: string) => {
    setFilter(k);
    setExpanded(false);
  };

  return (
    <section id="work">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kicker rv"><b>01</b> Open source</div>
            <h2 className="rv d1">{numberWords(DATA.prs.length)} merged. <span className="serif">Every one linked.</span></h2>
          </div>
          <p className="rv d2">Filter by project or search by keyword. Each row opens the actual pull request, with the discussion and review that got it merged.</p>
        </div>
        <div className="explorer rv">
          <div className="ex-top">
            <div className="chips" role="tablist" aria-label="Filter by repository">
              <button className={`chip${filter === 'all' ? ' on' : ''}`} role="tab" aria-selected={filter === 'all'} onClick={() => pick('all')}>
                All <em>{DATA.prs.length}</em>
              </button>
              {order.map((k) => (
                <button key={k} className={`chip${filter === k ? ' on' : ''}`} role="tab" aria-selected={filter === k} onClick={() => pick(k)}>
                  {repoName(k).replace('STEllAR ', '')} <em>{counts[k]}</em>
                </button>
              ))}
            </div>
            <label className="search">
              <Search />
              <input
                id="q"
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setExpanded(false); }}
                placeholder="Search: race, overflow, csv…"
                aria-label="Search pull requests"
              />
            </label>
          </div>
          <div>
            {shown.length === 0 && <div className="empty">No merged PRs match “{query}”.</div>}
            {shown.map((p) => (
              <a key={`${p[4]}#${p[2]}`} className="pr-row" href={`https://github.com/${p[4]}/pull/${p[2]}`} {...ext}>
                <span className="d">{p[0]}</span>
                <span className="rb"><i style={{ background: repoColor(p[1]) }} />{repoName(p[1])}</span>
                <span className="t">{p[3]}</span>
                <span className="n">#{p[2]}</span>
                <ArrowUpRight />
              </a>
            ))}
          </div>
          <div className="ex-foot">
            <span>
              Showing {shown.length} of {rows.length}
              {filter === 'all' && !q ? ' merged pull requests' : ' matching'}
            </span>
            {rows.length > LIMIT && (
              <button type="button" onClick={() => setExpanded((e) => !e)}>
                {expanded ? 'Show fewer ↑' : `Show all ${rows.length} ↓`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Case study ---------- */

const STEPS: [string, ReactNode][] = [
  ['Reproduce it exactly', <>Built a CSV with a 26-byte header and fixed 25-byte rows so that row 39's first <code>\r</code> lands on byte 1023. Sequential read: 60 rows. Parallel read: 61.</>],
  ['Find the root cause', <>The boundary split the terminator as <code>\r | \r\n</code>. <code>ProcessOverBufferValue</code> consumed the leftover <code>\r\n</code>, then fell through into the next row and counted it again.</>],
  ['Change as little as possible', <>Return early when the previous scanner already counted the row. One function in <code>string_value_scanner.cpp</code>, nothing else touched.</>],
  ['Leave a test behind', <>The regression test generates the file on the fly with <code>COPY … (FORMAT BLOB)</code>, so there's no data file to rot. It fails without the fix and passes with it.</>],
];

const Bytes = ({ list }: { list: [string, string?][] }) => (
  <div className="bytes">
    {list.map(([b, cls], i) => <span key={i} className={`byte${cls ? ` ${cls}` : ''}`}>{b}</span>)}
  </div>
);

export function CaseStudy() {
  return (
    <section id="case">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kicker rv"><b>02</b> Case study</div>
            <h2 className="rv d1">One byte, <span className="serif">one duplicate row.</span></h2>
          </div>
          <p className="rv d2">How I work on a bug, shown on a real DuckDB fix: reproduce it exactly, find the line that's wrong, change as little as possible, and leave a test behind.</p>
        </div>
        <div className="case rv">
          <div className="case-vis">
            <div className="case-meta"><span className="tag">duckdb/duckdb #25232</span><span className="tag">C++ · parallel CSV reader</span></div>
            <h3>Parallel read returned <span className="serif">61 rows.</span> The file had 60.</h3>
            <div className="buffers" aria-label="Diagram of a CSV row terminator split across two buffers">
              <div className="buf">
                <div className="cap"><span>buffer N</span><span>bytes 1018–1023</span></div>
                <Bytes list={[['3'], ['9'], [','], ['x'], ['y'], ['\\r', 'cr']]} />
              </div>
              <div className="buf">
                <div className="cap"><span>buffer N+1</span><span>bytes 0–5</span></div>
                <Bytes list={[['\\r', 'cr'], ['\\n', 'cr'], ['4', 'dup'], ['0', 'dup'], [',', 'dup'], ['…']]} />
              </div>
              <div className="boundary"><span>1024-byte boundary</span></div>
            </div>
            <div className="scanners">
              <div>scanner A ends on <code>\r</code> and counts row 39</div>
              <div>scanner B eats <code>\r\n</code>, falls through, <b>row 40 counted twice</b></div>
            </div>
            <div className="verdict"><span className="v-bad">before · 61 rows</span><span className="v-ok">after · 60 rows</span><span className="tag">0 regressions</span></div>
          </div>
          <div className="case-steps">
            {STEPS.map(([h, body], i) => (
              <div key={h} className={`cstep rv${i ? ` d${i}` : ''}`}>
                <span className="k">0{i + 1}</span>
                <div>
                  <h4>{h}</h4>
                  <p>{body}</p>
                  {i === STEPS.length - 1 && (
                    <a className="case-link" href="https://github.com/duckdb/duckdb/pull/25232" {...ext}>
                      Read the pull request <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Projects ---------- */

const Stack = ({ items }: { items: string[] }) => (
  <div className="stack">{items.map((s) => <span key={s}>{s}</span>)}</div>
);

interface Project {
  label: string;
  title: string;
  body: string;
  stack: string[];
  source: string;
  demo?: string;
  metrics?: [string, string][];
}

const PROJECTS: Project[] = [
  {
    label: 'AI safety tooling', title: 'Agent Red-Teaming Framework',
    body: 'Runs YAML attack suites against AI agents, scores them with deterministic checks plus an LLM judge, and diffs runs so regressions show up.',
    stack: ['Python', 'FastAPI', 'pytest', 'CLI'],
    source: 'https://github.com/alwaysprince05/Agent-Red-Teaming-Evaluation-Framework',
  },
  {
    label: 'Recommendation system', title: 'Orbo Beauty AI',
    body: 'A 6-stage ranking pipeline over 1,581 products with 80 automated tests.',
    metrics: [['0.86', 'P@5'], ['0.83', 'NDCG@5'], ['17.8ms', 'avg latency']],
    stack: ['FastAPI', 'React', 'scikit-learn'],
    source: 'https://github.com/alwaysprince05/Orbo.AI', demo: 'https://orbo-frontend-j0cg.onrender.com/',
  },
  {
    label: 'ML in production', title: 'Network Threat Detection',
    body: 'A 5-stage ML pipeline and REST API classifying 50,000+ traffic records, shipped to AWS ECR and EC2 through GitHub Actions.',
    stack: ['Python', 'FastAPI', 'MongoDB', 'AWS', 'Docker'],
    source: 'https://github.com/alwaysprince05/networksecurity',
  },
];

export function Projects() {
  return (
    <section id="projects">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kicker rv"><b>03</b> Projects</div>
            <h2 className="rv d1">Things I built <span className="serif">to learn the hard parts.</span></h2>
          </div>
          <p className="rv d2">Each one started from a failure mode I wanted to handle properly: duplicate delivery, bad input, ranking quality, deployment.</p>
        </div>
        <div className="proj-grid">
          <article className="tile spot proj feature rv" onPointerMove={spotlight}>
            <div className="feature-body">
              <span className="label">Featured · game backend</span>
              <h3>Game Leaderboard Service</h3>
              <p>An event-driven leaderboard for multiplayer games. Match results come in over REST, flow through Kafka, land in Postgres and get ranked in Redis sorted sets.</p>
              <ul className="pts">
                <li><span><b>Exactly-once effect on at-least-once delivery.</b> The match id and the points commit in one transaction, so a redelivered message never double-counts.</span></li>
                <li><span><b>No lost updates.</b> Concurrent score writes use <code>INSERT … ON CONFLICT DO UPDATE</code>.</span></li>
                <li><span><b>Poison messages don't block.</b> After 3 retries they go to a dead-letter topic.</span></li>
                <li><span><b>Redis is disposable.</b> A rebuild endpoint reloads rankings from Postgres, and <code>ZADD GT</code> stops stale writes from lowering a score.</span></li>
                <li><span><b>Tested against the real thing.</b> 26 JUnit + Testcontainers tests with real Kafka, Postgres and Redis in CI.</span></li>
              </ul>
              <Stack items={['Java 21', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis', 'Flyway', 'Testcontainers', 'Docker']} />
              <div className="proj-links">
                <a href="https://github.com/alwaysprince05/game-leaderboard-service" {...ext}><Code />Source code</a>
              </div>
            </div>
            <div className="feature-arch">
              <div style={{ width: '100%', maxWidth: 420 }}>
                <div className="arch" aria-label="Architecture: REST API to Kafka to consumer to Postgres and Redis">
                  <div className="node"><span>POST /api/v1/matches</span><em>REST</em></div>
                  <div className="wire" />
                  <div className="node hot"><span>match-completed</span><em>Kafka</em></div>
                  <div className="wire" />
                  <div className="node"><span>idempotent consumer</span><em>Spring</em></div>
                  <div className="wire" />
                  <div className="split">
                    <div className="node"><span>totals</span><em>Postgres</em></div>
                    <div className="node hot"><span>ranks</span><em>Redis</em></div>
                  </div>
                </div>
                <div className="side-note">failures after 3 retries → <b>match-completed.dlt</b></div>
              </div>
            </div>
          </article>
          {PROJECTS.map((p, i) => (
            <article key={p.title} className={`tile spot proj rv${i ? ` d${i}` : ''}`} onPointerMove={spotlight}>
              <span className="label">{p.label}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              {p.metrics && (
                <div className="metric-row">
                  {p.metrics.map(([v, k]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}
                </div>
              )}
              <Stack items={p.stack} />
              <div className="proj-links">
                <a href={p.source} {...ext}><Code />Source</a>
                {p.demo && <a href={p.demo} {...ext}><ArrowUpRight />Live demo</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- About ---------- */

const XP = [
  { when: 'Sep 2026', h: 'AI/ML Intern', org: 'Codefeast Enterprises · Remote', p: 'Evaluated outputs of 3+ LLMs, wrote prompts and training examples, tracked work in Jira.' },
  { when: 'Jan – Jun 2026', h: 'Software Engineering Simulation', org: 'JPMorgan Chase & Co. · Forage', p: 'Java / Spring Boot: Kafka consumers, transaction processing with Spring Data JPA, REST APIs.' },
  { when: '2024 – 2028', h: 'B.Tech, Computer Science & Engineering', org: 'Medhavi Skills University (Polaris School of Technology)', p: 'DSA, DBMS, Operating Systems, Computer Networks, Software Engineering.' },
];

const SKILLS: [string, string[]][] = [
  ['Languages', ['Java', 'C++', 'Python', 'SQL', 'TypeScript']],
  ['Backend', ['Spring Boot', 'Spring Data JPA', 'Kafka', 'REST', 'FastAPI']],
  ['Data', ['PostgreSQL', 'Redis', 'MySQL', 'MongoDB', 'Flyway']],
  ['Testing', ['JUnit 5', 'Mockito', 'Testcontainers', 'pytest']],
  ['Infra', ['Docker', 'GitHub Actions', 'AWS EC2 / ECR', 'Linux', 'CMake']],
  ['Systems', ['Concurrency', 'std::execution', 'Query engines', 'Debugging races']],
];

export function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="kicker rv"><b>04</b> About</div>
            <h2 className="rv d1">Experience <span className="serif">&amp; toolkit.</span></h2>
          </div>
          <p className="rv d2">Third-year CSE student. Most of what I know about production code I learned from maintainers who reviewed my pull requests line by line.</p>
        </div>
        <div className="xp">
          <div className="tile rv">
            <div className="xp-list">
              {XP.map((x) => (
                <div className="xp-item" key={x.h}>
                  <span className="when">{x.when}</span>
                  <div><h4>{x.h}</h4><div className="org">{x.org}</div><p>{x.p}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="tile rv d1">
            <div className="skills">
              {SKILLS.map(([label, items]) => (
                <div className="skill-row" key={label}>
                  <span className="label">{label}</span>
                  <Stack items={items} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact + footer ---------- */

export function Contact({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <div className="kicker rv" style={{ justifyContent: 'center' }}><b>05</b> Contact</div>
        <h2 className="rv d1">Let's build something <span className="serif">reliable.</span></h2>
        <p className="rv d2">I'm looking for a software engineering internship on a team that runs backend systems at scale, including the services behind online games. Email is the fastest way to reach me.</p>
        <div className="mail rv d3">
          <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
          <button type="button" className={copied ? 'done' : ''} onClick={onCopy}>
            <Copy /><span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="socials rv d4">
          <a href={LINKS.github} {...ext}><GitHub />GitHub</a>
          <a href={LINKS.linkedin} {...ext}><LinkedIn />LinkedIn</a>
          <a href={LINKS.leetcode} {...ext}><LeetCode />LeetCode</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© {new Date().getFullYear()} Prince Kumar Maurya</span>
        <span>
          Built with React, TypeScript &amp; Vite · PR data from GitHub, updated {new Date(DATA.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · <a href={LINKS.source} {...ext}>source</a>
        </span>
      </div>
    </footer>
  );
}

