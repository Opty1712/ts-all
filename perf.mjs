/* eslint-disable no-console */
import {execSync} from 'node:child_process';

const output = execSync('yarn tsc -p packages/app/tsconfig.json --noEmit --extendedDiagnostics', {encoding: 'utf8'});

function pick(label) {
  const match = output.match(new RegExp(`${label}:\\s+([\\d.]+)`));

  return match ? Number(match[1]) : 0;
}

function formatNumber(n) {
  return n.toLocaleString('ru-RU');
}

function formatMemory(kb) {
  const mb = kb / 1024;

  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  return `${(mb / 1024).toFixed(2)} GB`;
}

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const checkTime = pick('Check time');
const memoryKb = pick('Memory used');
const inst = pick('Instantiations');
const types = pick('Types');

console.log(`\n${colors.bold}${colors.cyan}🚀 TypeScript Perf Report${colors.reset}\n`);
console.log(`${colors.green}⏳ Time${colors.reset}             ${checkTime.toFixed(2)} s`);
console.log(`${colors.yellow}🧠 Memory${colors.reset}           ${formatMemory(memoryKb)}`);
console.log(`${colors.magenta}🔁 Instantiations${colors.reset}   ${formatNumber(inst)}`);
console.log(`${colors.cyan}🧩 Types${colors.reset}            ${formatNumber(types)}\n`);
