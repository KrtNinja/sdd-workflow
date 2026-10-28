// Команда diff: проверки DF-* по git.
import { flags, pos } from './args.mjs';
import { usage, needDir } from './cli.mjs';
import { loadFeature } from './feature.mjs';
import { add, report } from './findings.mjs';
import { gitInfo, gitShow, gitList } from './git.mjs';
import { approved, header, headerLine } from './md.mjs';

export function cmdDiff() {
  const dir = needDir(pos[0]);
  const g = gitInfo(dir);
  if (!g) usage('diff работает только в git-репозитории');
  const ref = flags.base || 'HEAD';
  const cur = loadFeature(dir);
  const base = loadFeature(
    dir,
    (f) => gitShow(g, ref, f),
    (d) => gitList(g, ref, d),
  );
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const body = (md) => (md || '').replace(/^Статус:.*$/m, '').trim();

  // протокол только дописывается
  if (base.protocol && cur.protocol) {
    const now = new Set([...cur.protocol.rows, ...cur.protocol.post].map((r) => norm(r.raw)));
    for (const r of [...base.protocol.rows, ...base.protocol.post])
      if (!now.has(norm(r.raw))) add('DF-01', cur.protocolFile, null, `строка #${r.id} изменена или удалена: «${r.raw.slice(0, 60)}»`);
    const scope = new Set(cur.protocol.outScope.map((x) => norm(x.text)));
    for (const x of base.protocol.outScope) if (!scope.has(norm(x.text))) add('DF-01', cur.protocolFile, null, `«Вне scope»: пункт изменён или удалён: «${x.text.slice(0, 60)}»`);
  } else if (base.protocol && !cur.protocol) add('DF-01', cur.protocolFile, null, 'протокол удалён');

  // ID не пропадают
  if (base.spec) for (const id of base.spec.reqs.keys()) if (!cur.spec?.reqs.has(id)) add('DF-02', cur.specFile, null, `${id} пропал`);
  const curAcs = new Set([...cur.slices.values()].flatMap((s) => s.acs.map((a) => a.id)));
  for (const s of base.slices.values()) for (const a of s.acs) if (!curAcs.has(a.id)) add('DF-02', s.file, null, `${a.id} пропал`);

  // одобренное не меняется молча
  if (base.spec && cur.spec && approved(base.spec.status) && approved(cur.spec.status) && body(base.spec.md) !== body(cur.spec.md))
    add('DF-03', cur.specFile, headerLine(cur.spec.md, 'Статус'), 'spec.md изменён, а статус остался «одобрено»');
  if (approved(base.slicesStatus) && approved(cur.slicesStatus)) {
    const changed = [...cur.slices.values()].filter((s) => base.slices.get(s.num)?.md !== s.md).map((s) => s.num);
    const gone = [...base.slices.keys()].filter((n) => !cur.slices.has(n));
    if (changed.length || gone.length || body(base.readme) !== body(cur.readme))
      add('DF-03', cur.readmeFile, headerLine(cur.readme, 'Статус'), `slices изменены (${[...changed, ...gone].join(', ') || 'README'}), а статус остался «одобрено»`);
  }
  for (const a of cur.featureAdrs) {
    const b = base.adrs.find((x) => x.num === a.num);
    if (b && /принят/i.test(b.status || '') && /принят/i.test(a.status || '') && body(b.md) !== body(a.md))
      add('DF-03', a.file, headerLine(a.md, 'Статус'), 'ADR изменён, а статус остался «принято»');
  }
  if (approved(base.slicesStatus)) {
    const baseAcs = new Set([...base.slices.values()].flatMap((s) => s.acs.map((a) => a.id)));
    for (const s of cur.slices.values()) {
      const fresh = s.acs.filter((a) => !baseAcs.has(a.id));
      for (const a of fresh) if (!a.added) add('DF-04', s.file, a.n, `${a.id} без «(добавлен после: …)»`);
      if (fresh.length && header(s.md, 'Изменён после') === null) add('DF-04', s.file, null, 'нет строки «Изменён после:» в шапке');
    }
  }
  const c = report({ base: ref });
  if (!flags.json) console.log(`\nСверка с ${ref}. Ошибок: ${c.err}, предупреждений: ${c.warn}`);
  process.exit(c.err ? 1 : 0);
}
