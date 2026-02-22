/** Сначала хелперы, а запуск в самом конце */
import {copyFile, mkdir, readdir, readFile, rename, rm, writeFile} from 'fs/promises';
import path from 'node:path';
import SVGFixer from 'oslllo-svg-fixer';
import svgToFont from 'svgtofont';

import {version} from '../../package.json';

/** Константы */
const PROJECT_PREFIX_NAME = 'SomeVKProject'; // Без пробелов, иначе все сломается!!!
const ICON_PREFIX = 'Icon_';
const FONT_NAME_HASH = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, '')
  .slice(0, 6);
const FONT_NAME = `${PROJECT_PREFIX_NAME}-${FONT_NAME_HASH}`;
const FONT_NAME_HASH_PASCAL = `${FONT_NAME_HASH.slice(0, 1).toUpperCase()}${FONT_NAME_HASH.slice(1)}`;
const FONT_NAME_IDENTIFIER = `${PROJECT_PREFIX_NAME}${FONT_NAME_HASH_PASCAL}`;

const tmpFolder = path.resolve(process.cwd(), 'tmp');
const srcFolder = path.resolve(process.cwd(), 'src');

/** Если будете менять, то так же заменить в `.figmaexportrc.js` */
const importedSVGFolder = path.resolve(process.cwd(), `${tmpFolder}/svgImported`);
const fixedSVGFolder = path.resolve(process.cwd(), `${tmpFolder}/svgFixed`);
const resultFolder = path.resolve(process.cwd(), `${tmpFolder}/result`);
const templatesFolder = path.resolve(process.cwd(), 'src/system/templates');

const dtsGeneratedFile = `${PROJECT_PREFIX_NAME}.d.ts`;
const dtsGeneratedFileWithHash = `${FONT_NAME}.d.ts`;

/** Менять не нужно, на него по коду есть завязки */
const typingFile = 'generatedTypes.ts';

/** Менять не нужно, на него по коду есть завязки */
const reactIconsFile = 'generatedReactIcons.tsx';
const cssFile = 'style.css';

/** Удаляем хеш из артефактов, где svgtofont использует fontName в идентификаторах/строках */
const normalizeGeneratedContent = (content: string): string => {
  return content.replaceAll(FONT_NAME_IDENTIFIER, PROJECT_PREFIX_NAME).replaceAll(FONT_NAME, PROJECT_PREFIX_NAME);
};

/** Создание шрифтов, шаблонов, стилей, типов */
const generateFonts = async () => {
  await svgToFont({
    src: fixedSVGFolder,
    dist: path.resolve(process.cwd(), resultFolder),
    fontName: FONT_NAME,
    css: true,
    classNamePrefix: PROJECT_PREFIX_NAME,
    website: {
      template: path.resolve(process.cwd(), `${templatesFolder}/website.njk`),

      /** Свой title */
      title: PROJECT_PREFIX_NAME,

      /** Свой logo */
      logo: path.resolve(process.cwd(), 'images/logo.svg'),

      /** Версия, можно из package.json брать */
      version: version,

      /** Мета-теги */
      meta: {
        description: 'Иконочный шрифт',
        keywords: 'figma, icons, svg, font, woff2, typescript, css',
      },

      /** Описание проекта в HTML */
      description: ``,

      /** Массив ссылок на страничку, пустой массив обязателен */
      links: [
        {
          title: 'Opty',
          url: 'https://opty.ru',
        },
      ],

      /** Кастомный текст в футере в HTML */
      footerInfo: `Сделано в VK. 2025`,
    },

    styleTemplates: templatesFolder,

    /** этот параметр отвечает за качество конечного шрифта, с такими настройками они хорошие */
    svgicons2svgfont: {
      fontHeight: 1000,
      normalize: true,
    },

    typescript: true,

    /** Если вам вдруг нужны эти форматы, то нужно удалить отсюда */
    excludeFormat: ['eot', 'svg', 'symbol.svg', 'ttf', 'woff'],
  });

  console.log('Шрифт сгенерирован');
};

/** Удаляем хеш из d.ts, чтобы внутренние типы/импорты оставались стабильными */
const normalizeGeneratedDTS = async () => {
  const sourceDtsPath = path.resolve(process.cwd(), resultFolder, dtsGeneratedFileWithHash);
  const targetDtsPath = path.resolve(process.cwd(), resultFolder, dtsGeneratedFile);
  const dts = await readFile(sourceDtsPath, {encoding: 'utf-8'});
  const normalizedDts = normalizeGeneratedContent(dts);

  await writeFile(targetDtsPath, normalizedDts, {flag: 'w'});
};

/** Генерируем компоненты иконок и сохраняем файл в tmp */
const createIconComponents = async () => {
  const generatedBase = await readFile(path.resolve(process.cwd(), resultFolder, reactIconsFile), {encoding: 'utf-8'});
  const base = normalizeGeneratedContent(generatedBase);
  const iconNames = await getIconNames();

  const exports = `export const {${iconNames.join(', ')}} = icons;
`;

  await writeFile(path.resolve(process.cwd(), srcFolder, reactIconsFile), base + exports, {flag: 'w'});

  console.log('Иконки как React-компоненты созданы');
};

/** Убираем cache-busting query у woff2, чтобы vite корректно резолвил ассет */
const normalizeGeneratedCSSFontUrl = async () => {
  const cssPath = path.resolve(process.cwd(), resultFolder, cssFile);
  const css = await readFile(cssPath, {encoding: 'utf-8'});
  const fixedCss = css.replace(/\.woff2\?t=\d+/g, '.woff2');

  if (css !== fixedCss) {
    await writeFile(cssPath, fixedCss, {flag: 'w'});
  }
};

/** Получаем итоговые имена иконок */
const getIconNames = async () => {
  const content = await readFile(path.resolve(process.cwd(), resultFolder, dtsGeneratedFile), {encoding: 'utf-8'});
  const contentLines = content.split(/\n/);
  const iconNames: Array<string> = [];
  const iconLineStart = '  ';

  contentLines.forEach((line) => {
    if (line.startsWith(iconLineStart)) {
      const iconName = line.split('=')[0].trim();
      iconNames.push(iconName);
    }
  });

  return iconNames;
};

/** Проверяем иконки на корректность имен */
const checkIconNames = async () => {
  const allowedSymbolsInIcons = /^[\w.-]+$/;
  const iconNames = await readdir(path.resolve(process.cwd(), importedSVGFolder));
  const incorrectIconName = iconNames.find((icon) => !allowedSymbolsInIcons.test(icon));

  if (incorrectIconName) {
    console.error(`Найдена иконка с некорректным именем ${incorrectIconName}`);
    process.exit(1);
  } else {
    console.log('Имена иконок проверены');
  }
};

/** Создаем временную папку */
const createTmpFolder = async () => {
  await mkdir(fixedSVGFolder);
};

/** Исправляем заливку иконок */
const fixSVGFill = async () => {
  await SVGFixer(path.resolve(process.cwd(), importedSVGFolder), fixedSVGFolder, {
    showProgressBar: true,
    throwIfDestinationDoesNotExist: false,
  }).fix();

  console.log('Заливки иконок исправлены');
};

/** Копируем `${PROJECT_PREFIX_NAME}.d.ts` → `src/generatedTypes.ts` для типизации компонентов */
const copyDTS = async () => {
  await copyFile(
    path.resolve(process.cwd(), resultFolder, dtsGeneratedFile),
    path.resolve(process.cwd(), srcFolder, typingFile),
  );
};

/** Очищаем сгенерированную папку */
const clear = async () => {
  await rm(resultFolder, {recursive: true, force: true});
  await rm(fixedSVGFolder, {recursive: true, force: true});
};

/** Добавляем префикс к имени иконки */
const addPrefixToIcons = async () => {
  const iconNames = await readdir(fixedSVGFolder);

  iconNames.forEach((icon) => {
    rename(path.resolve(fixedSVGFolder, icon), path.resolve(fixedSVGFolder, ICON_PREFIX + icon)).catch(console.error);
  });
};

/** КОМПОЗИЦИЯ КОМАНД */

console.log('Иконки успешно скачаны из Figma');

await clear();
await checkIconNames();
await createTmpFolder();
await fixSVGFill();
await addPrefixToIcons();
await generateFonts();
await normalizeGeneratedCSSFontUrl();
await normalizeGeneratedDTS();
await copyDTS();
await createIconComponents();

console.log('Обработка закончена');
