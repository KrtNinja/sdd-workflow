// Команды gen и next.
import { pos } from './args.mjs';
import { usage, needDir } from './cli.mjs';
import { loadFeature } from './feature.mjs';
import { genGuessed } from './protocol.mjs';
import { genReadme } from './readme.mjs';

export function cmdGen() {
  const what = pos[0];
  if (what !== 'readme' && what !== 'guessed') usage('gen readme | gen guessed');
  const m = loadFeature(needDir(pos[1]));
  if (what === 'readme') genReadme(m);
  else genGuessed(m);
}

export function cmdNext() {
  const kind = (pos[0] || '').toLowerCase();
  const m = loadFeature(needDir(pos[1]));
  const max = (arr) => arr.reduce((a, b) => Math.max(a, b), 0);
  if (kind === 'fr' || kind === 'nfr') {
    const pre = kind.toUpperCase();
    const n = max([...(m.spec?.reqs.keys() || [])].filter((id) => id.startsWith(`${pre}-`)).map((id) => Number(id.split('-')[1])));
    console.log(`${pre}-${n + 1}`);
  } else if (kind === 'ac') {
    const num = pos[2];
    if (!/^\d{3}$/.test(num || '')) usage('next AC docs/<feature> <NNN> [B|F]');
    const side = (pos[3] || '').toUpperCase().replace(/[^BF]/g, '');
    const all = [...m.slices.values()].flatMap((s) => s.acs).filter((a) => a.acNum === num && a.side === side);
    console.log(`AC-${num}-${side}${max(all.map((a) => a.k)) + 1}`);
  } else if (kind === 'slice') {
    console.log(String(max([...m.slices.keys()].map(Number)) + 1).padStart(3, '0'));
  } else if (kind === 'adr') {
    console.log(String(max(m.adrs.map((a) => Number(a.num))) + 1).padStart(4, '0'));
  } else usage('next FR | NFR | AC | slice | adr');
}
