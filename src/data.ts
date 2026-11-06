// data.json is regenerated from the GitHub API by scripts/fetch-github-data.mjs on every deploy.
import raw from './data.json';

// [date, repoKey, number, title, owner/repo]
export type MergedPR = [string, string, number, string, string];
// [repoKey, number, title, owner/repo]
export type OpenPR = [string, number, string, string];

interface SiteData {
  updated: string;
  prs: MergedPR[];
  open: OpenPR[];
  cal: { start: string; total: number; counts: number[] };
}

export const DATA = raw as unknown as SiteData;

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 58 -> "Fifty-eight"; falls back to digits from 1000 up. */
export function numberWords(n: number): string {
  const w = (x: number): string =>
    x < 20 ? ONES[x]
    : x < 100 ? TENS[Math.floor(x / 10)] + (x % 10 ? `-${ONES[x % 10]}` : '')
    : `${ONES[Math.floor(x / 100)]} hundred${x % 100 ? ` and ${w(x % 100)}` : ''}`;
  const s = n >= 0 && n < 1000 ? w(n) : n.toLocaleString('en-US');
  return s[0].toUpperCase() + s.slice(1);
}
