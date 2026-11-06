// Refreshes src/data.json from the GitHub API. Run in CI before `vite build`,
// or locally with: GITHUB_TOKEN=$(gh auth token) npm run data
// On any failure or suspicious result it exits non-zero and leaves the file untouched.
import { readFile, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const USER = process.env.GH_USER || 'alwaysprince05';
const TOKEN = process.env.GH_DATA_TOKEN || process.env.GITHUB_TOKEN;
const OUT = fileURLToPath(new URL('../src/data.json', import.meta.url));

// owner/repo -> key used by the site for names and colours (see src/lib.ts).
const KEYS = {
  'NVIDIA/stdexec': 'stdexec',
  'TheHPXProject/hpx': 'hpx',
  'STEllAR-GROUP/hpx': 'hpx',
  'duckdb/duckdb': 'duckdb',
  'ClickHouse/ClickHouse': 'clickhouse',
  'tensorflow/tensorflow': 'tensorflow',
  'pytorch/pytorch': 'pytorch',
  'STEllAR-GROUP/docker_build_env': 'docker_build_env',
  'NVIDIA/NeMo-Agent-Toolkit': 'nemo',
  'keras-team/keras': 'keras',
  'openshift/origin': 'openshift',
  'Project-HAMi/HAMi-core': 'hami',
};
const keyFor = (repo) => KEYS[repo] ?? repo.split('/')[1].toLowerCase();
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-data' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(`GitHub API: ${body.errors.map((e) => e.message).join('; ')}`);
  return body.data;
}

const SEARCH = `query($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 100, after: $after) {
    issueCount
    pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest { number title mergedAt closedAt createdAt repository { nameWithOwner isPrivate } } }
  }
}`;

async function searchPRs(q) {
  const out = [];
  let after = null;
  for (let page = 0; page < 10; page++) {
    const { search } = await gql(SEARCH, { q, after });
    out.push(...search.nodes.filter((n) => n && n.repository && !n.repository.isPrivate));
    if (!search.pageInfo.hasNextPage) break;
    after = search.pageInfo.endCursor;
  }
  return out;
}

function clean(pr) {
  const repo = pr.repository.nameWithOwner;
  if (!REPO_RE.test(repo) || !Number.isInteger(pr.number)) throw new Error(`Unexpected PR shape: ${repo}#${pr.number}`);
  return { repo, key: keyFor(repo), number: pr.number, title: String(pr.title).trim() };
}

async function main() {
  if (!TOKEN) throw new Error('Set GITHUB_TOKEN (or GH_DATA_TOKEN).');
  const notMine = `-user:${USER}`;

  const [merged, botMerged, open, cal] = await Promise.all([
    searchPRs(`author:${USER} is:pr is:merged ${notMine}`),
    // PyTorch's merge bot closes PRs and lands the commit, tagging the PR "Merged".
    searchPRs(`author:${USER} is:pr is:closed is:unmerged label:Merged repo:pytorch/pytorch`),
    searchPRs(`author:${USER} is:pr is:open ${notMine}`),
    gql(
      `query($u: String!) { user(login: $u) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount } } } } } }`,
      { u: USER },
    ),
  ]);

  const seen = new Set();
  const prs = [...merged, ...botMerged]
    .map((p) => ({ ...clean(p), date: (p.mergedAt ?? p.closedAt).slice(0, 10) }))
    .filter((p) => !seen.has(`${p.repo}#${p.number}`) && seen.add(`${p.repo}#${p.number}`))
    .sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number)
    .map((p) => [p.date, p.key, p.number, p.title, p.repo]);

  const openPRs = open
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clean)
    .map((p) => [p.key, p.number, p.title, p.repo]);

  const c = cal.user.contributionsCollection.contributionCalendar;
  const days = c.weeks.flatMap((w) => w.contributionDays);
  const calendar = { start: days[0].date, total: c.totalContributions, counts: days.map((d) => d.contributionCount) };

  // Sanity checks: merged PRs never go away, so a big drop means the API returned a partial result.
  let prev = null;
  try {
    prev = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    /* first run */
  }
  const prevCount = prev?.prs?.length ?? 0;
  if (prs.length === 0) throw new Error('No merged PRs returned; refusing to overwrite.');
  if (prs.length < prevCount - 2) throw new Error(`Merged PRs dropped from ${prevCount} to ${prs.length}; refusing to overwrite.`);
  if (days.length < 300) throw new Error(`Calendar has only ${days.length} days; refusing to overwrite.`);

  const data = { updated: new Date().toISOString(), prs, open: openPRs, cal: calendar };
  const tmp = `${OUT}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data)}\n`);
  await rename(tmp, OUT);
  console.log(`data.json: ${prs.length} merged (was ${prevCount}), ${openPRs.length} open, ${calendar.total} contributions`);
}

main().catch((err) => {
  console.error(`::warning::GitHub data refresh failed, keeping the committed snapshot. ${err.message}`);
  process.exit(1);
});
