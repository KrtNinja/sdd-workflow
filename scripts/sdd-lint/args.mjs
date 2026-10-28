// Разбор process.argv: флаги, позиционные аргументы, команда.

export const argv = process.argv.slice(2);
export const flags = { json: false, snapshot: false, base: null };
export const pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') flags.json = true;
  else if (a === '--snapshot') flags.snapshot = true;
  else if (a === '--base') flags.base = argv[++i];
  else if (a.startsWith('--base=')) flags.base = a.slice(7);
  else pos.push(a);
}
const COMMANDS = ['check', 'gate', 'approve', 'diff', 'snapshot', 'guard', 'gen', 'next', 'help'];
export const cmd = COMMANDS.includes(pos[0]) ? pos.shift() : 'check';
