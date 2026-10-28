// Справка и ошибки вызова.
import fs from 'node:fs';
import path from 'node:path';

import { skill, lintCmd } from './config.mjs';
import { rel } from './md.mjs';

export const HELP = `sdd-lint — проверки артефактов планирования SDD

  sdd-lint [check] docs/<feature> [--snapshot] [--json]
      все проверки и текущий этап. Код 1 — есть ошибки.
      --snapshot — заодно снять снимок защищённых частей для guard
  sdd-lint gate <spec|slices|adr|decide|build> docs/<feature>
      ворота перед этапом. Код 3 — этап начинать нельзя
  sdd-lint approve <spec|slices> docs/<feature>
  sdd-lint approve adr docs/<feature> [NNNN]
      поставить «одобрено <дата>» («принято» для ADR), если нет ошибок lint
      и защищённые части не менялись после снимка. Запускает только человек
  sdd-lint diff docs/<feature> [--base <ref>]
      проверки по git (по умолчанию против HEAD): протокол только дописывается,
      ID не пропадают, одобренный файл не меняется без сброса статуса
  sdd-lint snapshot <файл | docs/<feature>>
      снимок защищённых частей перед humanizer
  sdd-lint guard <файл | docs/<feature>> [--base <ref>]
      что humanizer менять не должен: блоки кода, шапки, заголовки, таблицы,
      «тексты», числа, ID. Сверка со снимком, без снимка — с git
  sdd-lint gen readme docs/<feature>
      таблица slices, «Покрытие Dev Spec» и «Порядок работ» в slices/README.md
  sdd-lint gen guessed docs/<feature>
      таблица «Где агент угадал бы не так» в протоколе
  sdd-lint next <FR|NFR|slice|adr> docs/<feature>
  sdd-lint next AC docs/<feature> <NNN> [B|F]
      следующий свободный номер

Коды выхода: 0 — порядок, 1 — ошибки, 2 — неверный вызов, 3 — ворота закрыты.

Форма команд в подсказках: SDD_SKILL_PREFIX (по умолчанию «/») и SDD_LINT_CMD
(по умолчанию «node scripts/sdd-lint.mjs»).`;

export const usage = (msg) => {
  console.error(msg ? `${msg}\nСправка: ${lintCmd('help')}` : HELP);
  process.exit(2);
};

export function needDir(d) {
  if (!d) usage('Укажи папку фичи: docs/<feature>');
  if (fs.existsSync(d) && fs.statSync(d).isDirectory()) return d;
  const parent = path.dirname(path.resolve(d));
  const slug = path.basename(path.resolve(d));
  if (!fs.existsSync(parent)) {
    console.error(`Нет папки ${rel(parent)}. Запускайте из корня репозитория с доками.`);
    process.exit(2);
  }
  const known = fs
    .readdirSync(parent)
    .filter((x) => x !== 'adr' && fs.statSync(path.join(parent, x)).isDirectory())
    .filter((x) => ['brainstorming.md', 'spec.md'].some((f) => fs.existsSync(path.join(parent, x, f))));
  console.error(
    [
      `Нет папки ${d}.`,
      known.length ? `Фичи в ${rel(parent)}/: ${known.join(', ')}.` : `В ${rel(parent)}/ пока нет фич.`,
      `Новая фича начинается с ${skill('sdd-grill', slug)}.`,
    ].join(' '),
  );
  process.exit(2);
}
