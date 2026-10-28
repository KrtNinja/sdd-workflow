#!/usr/bin/env node
// sdd-lint — детерминированные проверки артефактов планирования SDD.
// Всё, что можно проверить или вывести скриптом, делает скрипт; модели остаётся смысл.
// Без зависимостей, Node 18+. Справка: node sdd-lint.mjs help
//
// Здесь только выбор команды. Код — в sdd-lint/, по модулю на тему; читай только нужный.
// Первая строка модуля — его назначение; карта: grep -m1 . sdd-lint/*.mjs
// Правило XX-NN проверяется в модуле своего артефакта или команды, подсказка к нему — в rules.mjs.

import { argv, cmd } from './sdd-lint/args.mjs';
import { HELP } from './sdd-lint/cli.mjs';
import { cmdApprove } from './sdd-lint/cmd-approve.mjs';
import { cmdCheck, cmdGate } from './sdd-lint/cmd-check.mjs';
import { cmdDiff } from './sdd-lint/cmd-diff.mjs';
import { cmdGen, cmdNext } from './sdd-lint/cmd-gen.mjs';
import { cmdSnapshot, cmdGuard } from './sdd-lint/cmd-guard.mjs';

if (cmd === 'help' || argv.includes('--help') || argv.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

({ check: cmdCheck, gate: cmdGate, approve: cmdApprove, diff: cmdDiff, snapshot: cmdSnapshot, guard: cmdGuard, gen: cmdGen, next: cmdNext })[cmd]();
