/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

const COUNT = Number(process.argv[2] ?? 2000);

const root = process.cwd();

const ruFile = path.join(root, 'packages/app/src/i18n/locales/ru.json');

const routesFile = path.join(root, 'packages/app/src/router/routes.ts');

const pagesDir = path.join(root, 'packages/app/src/pages');

// ---------- 1️⃣ RU JSON ----------
const ru = JSON.parse(fs.readFileSync(ruFile, 'utf8'));

for (let i = 1; i <= COUNT; i++) {
  const index = String(i).padStart(5, '0');
  const key = `stress.key_${index}`;
  ru[key] = `Stress text ${index}`;
}

fs.writeFileSync(ruFile, JSON.stringify(ru, null, 2) + '\n');

// ---------- 2️⃣ ROUTES ----------
let routesContent = fs.readFileSync(routesFile, 'utf8');

let routesToInsert = '';

for (let i = 1; i <= COUNT; i++) {
  const index = String(i).padStart(5, '0');
  const routeBase = `/stress-page-${index}`;

  routesToInsert += `  '${routeBase}': {
    params: {
      stressTest: true,
    },
    '/:id': {},
  },
`;
}

routesContent = routesContent.replace(
  /}\s*as const satisfies RouteNode;/,
  routesToInsert + '} as const satisfies RouteNode;',
);

fs.writeFileSync(routesFile, routesContent);

// ---------- 3️⃣ COMPONENTS ----------
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, {recursive: true});
}

for (let i = 1; i <= COUNT; i++) {
  const index = String(i).padStart(5, '0');
  const key = `stress.key_${index}`;
  const componentName = `StressPage${index}`;

  const componentFile = path.join(pagesDir, `${componentName}.tsx`);

  fs.writeFileSync(
    componentFile,
    `import {t} from 'i18next';

export const ${componentName} = () => {
  return <div>{t('${key}')}</div>;
};
`,
  );
}

console.log(`Generated ${COUNT} keys, routes and components`);
