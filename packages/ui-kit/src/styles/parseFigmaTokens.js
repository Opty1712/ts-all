/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const {readFileSync, writeFileSync} = require('fs');
const path = require('path');
const decompress = require('decompress');

async function parseTokensAndGenerateFiles() {
  const generatedDir = path.join(__dirname, './generated');
  const designTokensZipFile = path.join(__dirname, 'design-tokens.zip');
  const designTokensB2BZipFile = path.join(__dirname, 'design-tokens-b2b.zip');
  const jsonTokensFolder = `${generatedDir}/unzipped-tokens`;
  const tailwindBaseCSS = path.join(__dirname, 'tailwindBase.css');

  /** запускаем тут, чтобы ниже уже можно было сразу загрузить JSON */
  await unzip();

  /** пути к файлам внутри ZIP */
  const darkThemeData = loadJson('B2B colors.Dark Blue.tokens.json');
  const lightThemeData = loadJson('B2B colors.Light Blue.tokens.json');
  const lightReferences = loadJson('Colors.Light Blue.tokens.json');
  const darkReferences = loadJson('Colors.Dark Blue.tokens.json');
  const baseColorsData = loadJson('Сolors 2.Mode 1.tokens.json');
  const borderRadiusData = loadJson('border-radius.Value.tokens.json');
  const spacingData = loadJson('spacing.Mode 1.tokens.json');
  const shadowsData = loadJson('effect.styles.tokens.json');

  /** пути к файлам, которые нужно в итоге создать */
  const tailwindThemeFile = `${generatedDir}/tailwindTheme.json`;
  const tailwindDarkColorsFile = `${generatedDir}/tailwindDarkColors.json`;
  const tailwindLightColorsFile = `${generatedDir}/tailwindLightColors.json`;
  const tailwindInitialFile = `${generatedDir}/tailwindInitialFile.css`;
  const figmaTokensDTSFile = `${generatedDir}/types.ts`;
  const TWClassNamesFile = `${generatedDir}/TWClassNames.ts`;

  /** Маппинг ключей темы на имя палета, чтобы получить tailwind классы */
  const borderRadius = 'borderRadius';
  const spacing = 'spacing';
  const boxShadow = 'boxShadow';
  const rainbowContent = 'rainbowContent';
  const rainbowSurface = 'rainbowSurface';
  const overlay = 'overlay';

  const themeKeysToVariableKeys = {
    borderRadius,
    boxShadow,
    margin: spacing,
    padding: spacing,
    gap: spacing,
    height: spacing,
    'min-height': spacing,
    width: spacing,
    'min-width': spacing,
    spacing,
    caret: 'color',
  };

  async function unzip() {
    /** Разархивируем токены из основного файла */
    await decompress(designTokensZipFile, jsonTokensFolder);

    /** Разархивируем токены из B2B файла */
    await decompress(designTokensB2BZipFile, jsonTokensFolder);
  }

  /** Загрузка JSON-файлов */
  function loadJson(filePath) {
    return JSON.parse(readFileSync(`${jsonTokensFolder}/${filePath}`, 'utf8'));
  }

  /** Извлечение всех базовых цветов */
  function extractBaseColors(data) {
    const baseColors = {};

    function traverse(obj, path = []) {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          traverse(obj[key], [...path, key]);
        } else if (key === '$value' && typeof obj[key] === 'string') {
          const fullPath = path.join('.');
          baseColors[fullPath] = obj[key];
        }
      }
    }

    traverse(data);

    return baseColors;
  }

  /** Замена ссылок цветов на реальные HEX значения */
  function resolveReferences(tokens, baseColors) {
    const resolvedTokens = structuredClone(tokens);

    function resolveValue(value) {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1);

        return baseColors[refPath] || value;
      }

      return value;
    }

    function resolveObject(obj) {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          resolveObject(obj[key]);
        } else if (key === '$value') {
          obj[key] = resolveValue(obj[key]);
        } else if (key === 'color') {
          obj[key] = resolveValue(obj[key]);
        }
      }
    }

    resolveObject(resolvedTokens);

    return resolvedTokens;
  }

  /** Обработка не цветовых токенов (borderRadius + spacing) */
  function processNonColors(data) {
    const result = {};

    for (const key in data) {
      result[key] = data[key].$value;
    }

    return result;
  }

  /** Обработка теней и перемещение их в каждую тему */
  function getShadows(shadowsData) {
    /**
     * Конвертируем массив теней в корректную CSS строку, пример:
    [
      {
        "offsetX": "0px",
        "offsetY": "0px",
        "blur": "2px",
        "spread": "0px",
        "color": "{core.shadow.black-alpha-1}"
      },
      {
        "offsetX": "0px",
        "offsetY": "2px",
        "blur": "2px",
        "spread": "0px",
        "color": "{core.shadow.black-alpha-3}"
      }
    ]

    ↓

    «0px 0px 2px 0px #0000001a, 0px 2px 2px 0px "#00000033»
    * */
    function getShadowValue(value) {
      const shadow = value.reduce((accumulator, {offsetX, offsetY, blur, spread, color}, index) => {
        const comma = index < value.length - 1 ? ', ' : '';

        return `${accumulator}${offsetX} ${offsetY} ${blur} ${spread} ${color}${comma}`;
      }, '');

      return shadow;
    }

    /** Возвращает корректные значения цветов для тени */
    function getShadowColors(elevation, shadowColors) {
      const prefix = '{core.shadow.';
      const clonedElevation = structuredClone(elevation);

      for (const key in clonedElevation) {
        if (clonedElevation[key].$value) {
          clonedElevation[key].$value.forEach((shadow) => {
            if (shadow.color?.startsWith(prefix)) {
              const shadowKey = shadow.color.slice(prefix.length, -1);
              shadow.color = shadowColors.core.shadow[shadowKey].$value || shadow.color;
            }
          });

          clonedElevation[key] = getShadowValue(clonedElevation[key].$value);
        }
      }

      return clonedElevation;
    }

    return {
      lightShadows: getShadowColors(shadowsData.Elevation, lightReferences),
      darkShadows: getShadowColors(shadowsData.Elevation, darkReferences),
    };
  }

  /** Возвращает цвета из основной палитры, но которые используются в B2B, например «rainbow» */
  function resolveB2CColors(tokens, tokenGroupKey) {
    const result = {};
    const palette = tokens.core[tokenGroupKey];

    for (const key in palette) {
      if (palette[key].$type === 'color') {
        if (palette[key].$value.startsWith('{') && palette[key].$value.endsWith('}')) {
          const refPath = palette[key].$value.slice(1, -1).split('.');
          let refValue = tokens;

          for (const part of refPath) {
            refValue = refValue[part];
          }

          result[key] = refValue.$value;
        } else {
          result[key] = palette[key].$value;
        }
      } else if (typeof palette[key] === 'object') {
        // Если это не цвет, а вложенный объект, рекурсивно обрабатываем его
        result[key] = resolveB2CColors({core: {[key]: palette[key]}}, key);
      }
    }

    return result;
  }

  /**
   * Упрощение структуры цветов
   * {"$type": "color","$value": "#e1e3e6"} → "#e1e3e6"
   * */
  function simplifyColors(colors) {
    const simplified = {};

    for (const category in colors) {
      simplified[category] = {};

      for (const key in colors[category]) {
        simplified[category][key] = colors[category][key].$value;
      }
    }

    return simplified;
  }

  /** Генерация единого JSON файла со всеми токенами. Эта часть кода написана с помощью https://chat.deepseek.com/ */
  async function combineAllTokensToJSON() {
    /** Извлечение базовых цветов */
    const baseColors = extractBaseColors(baseColorsData);
    const baseColorsPalette = simplifyColors(baseColorsData);

    /** Получаем Elevation (shadows) */
    const {lightShadows, darkShadows} = getShadows(shadowsData, baseColors);

    /** Получаем Rainbow и добавляем их в темы */
    lightThemeData[rainbowContent] = resolveB2CColors(lightReferences, rainbowContent);
    darkThemeData[rainbowContent] = resolveB2CColors(darkReferences, rainbowContent);
    lightThemeData[rainbowSurface] = resolveB2CColors(lightReferences, rainbowSurface);
    darkThemeData[rainbowSurface] = resolveB2CColors(darkReferences, rainbowSurface);

    /** Получаем Overlay и добавляем их в темы */
    lightThemeData[overlay] = resolveB2CColors(lightReferences, overlay);
    darkThemeData[overlay] = resolveB2CColors(darkReferences, overlay);

    /** Генерация цветовых палитр */
    const darkThemePalette = resolveReferences(darkThemeData, baseColors);
    const lightThemePalette = resolveReferences(lightThemeData, baseColors);

    /** Обработка радиусов скругления */
    const borderRadius = processNonColors(borderRadiusData);

    /** Обработка отступов */
    const spacing = processNonColors(spacingData);

    return {
      colors: {
        darkThemePalette,
        lightThemePalette,
        baseColorsPalette,
      },
      shadows: {lightShadows, darkShadows},
      borderRadius,
      spacing,
      baseColors,
    };
  }

  /** Сделать первую букву заглавной */
  function uppercaseFirstSymbol(string) {
    return string.length ? string[0].toUpperCase() + string.slice(1) : string;
  }

  /** Сделать первую букву маленькой */
  function lowercaseFirstSymbol(string) {
    return string.length ? string[0].toLowerCase() + string.slice(1) : string;
  }

  /**
   * Преобразовать ключ в camelCase, пример:
   * "rp.system/blue-040" → "rpSystemBlue040"
   * */
  function convertToCamelCase(string) {
    const symbolsToSplitBy = /[-_/\. ]/g;

    return string
      .split(symbolsToSplitBy)
      .map((item, index) => (index ? uppercaseFirstSymbol(item) : lowercaseFirstSymbol(item)))
      .join('');
  }

  /** Создает кусок JSON для типа цветов (Fill, Surface, Text...) */
  function generateTokenColors(colors, prefix = 'B2bColors.') {
    const theme = {};

    for (const [category, values] of Object.entries(colors)) {
      for (const [key, value] of Object.entries(values)) {
        const camelCaseKey = convertToCamelCase(`${prefix || ''}${category}.${key}`);
        theme[camelCaseKey] = typeof value === 'string' ? value : value.$value;
      }
    }

    return theme;
  }

  /** Генерируем и сохраняем типизацию для имен токенов, пока только для «core» токенов */
  function saveTokensDTS(palette) {
    const tokenNames = Object.keys(palette).reduce((accumulator, key) => {
      accumulator.push(`'${convertToCamelCase(key)}'`);

      return accumulator;
    }, []);

    const tokenTyped = `export type FigmaColorToken = \n| ${tokenNames.join('\n| ')};\n`;
    writeFileSync(figmaTokensDTSFile, tokenTyped);
  }

  /** Генерируем и сохраняем массив финальных класснеймов, используемых в TailWind */
  function saveTWClassNames(palette, spacingTokens, borderRadiusTokens, shadowTokens) {
    /** Получаем массив класснеймов, определенного префиксом типа */
    function getTWClassNamesChunk(palette, prefix) {
      const classNames = Object.keys(palette).reduce((accumulator, key) => {
        accumulator.push(`'${prefix}-${convertToCamelCase(key)}'`);

        return accumulator;
      }, []);

      return `export const ${prefix}Colors = [\n ${classNames.join(',\n ')}\n] as const;\n\n`;
    }

    /** Получаем массив CSS переменных */
    function getCSSVarsChunk(palette) {
      const cssVars = Object.keys(palette).reduce((accumulator, key) => {
        accumulator.push(`'--${convertToCamelCase(key)}'`);

        return accumulator;
      }, []);

      return cssVars;
    }

    const tailWindPrefixes = ['bg', 'text', 'fill'];

    const result = tailWindPrefixes.reduce((accumulator, current) => {
      return accumulator + getTWClassNamesChunk(palette, current);
    }, '');

    /** Получаем все CSS переменные: цвета, spacing, borderRadius, boxShadow */
    const colorVars = getCSSVarsChunk(palette);
    const spacingVars = getCSSVarsChunk(generateTokenColors({spacing: spacingTokens}, ''));
    const borderRadiusVars = getCSSVarsChunk(generateTokenColors({borderRadius: borderRadiusTokens}, ''));
    const boxShadowVars = getCSSVarsChunk(generateTokenColors({Elevation: shadowTokens}, 'boxShadow.'));

    /** Объединяем все переменные */
    const allCssVars = [...colorVars, ...spacingVars, ...borderRadiusVars, ...boxShadowVars];

    /** Сохраняем TS файл со всеми константами */
    const cssVarsContent = `export const cssVars = [\n ${allCssVars.join(',\n ')}\n] as const;\n\n`;
    writeFileSync(TWClassNamesFile, result + cssVarsContent);

    /**  Создаем JS файл только с константой cssVars */
    const TWClassNamesJSFile = TWClassNamesFile.replace('.ts', '.js');
    const jsContent = `export const cssVars = [\n ${allCssVars.join(',\n ')}\n];\n`;
    writeFileSync(TWClassNamesJSFile, jsContent);
  }

  /**
   * Конвертируем палет в CSS переменные, пример:
   * {"accent.green.100": "#faff00"} => "--accentGreen100: #faff00;"
   * */
  function convertPaletteToCSSVars(palette) {
    return Object.entries(palette).reduce((accumulator, [key, value]) => {
      return `${accumulator}
    --${convertToCamelCase(key)}: ${value};`;
    }, '');
  }

  /** Получить финальные CSS переменные с двумя темами и другими токенами */
  function saveCSSVars({tailwindLightColors, tailwindDarkColors, jsonTokens}) {
    const base = readFileSync(tailwindBaseCSS, {encoding: 'utf-8'});
    const {spacing, borderRadius, shadows, colors} = jsonTokens;

    const CSSVars = `${base}

:root {
  ${convertPaletteToCSSVars(generateTokenColors({spacing}, ''))}
  ${convertPaletteToCSSVars(generateTokenColors({borderRadius}, ''))}
  ${convertPaletteToCSSVars(generateTokenColors(colors.baseColorsPalette, ''))}
  
  ${convertPaletteToCSSVars(tailwindLightColors)}
  ${convertPaletteToCSSVars(generateTokenColors({Elevation: shadows.lightShadows}, 'boxShadow.'))}
}
  
html.dark {${convertPaletteToCSSVars(tailwindDarkColors)}
  ${convertPaletteToCSSVars(generateTokenColors({Elevation: shadows.darkShadows}, 'boxShadow.'))}
}`;

    writeFileSync(tailwindInitialFile, CSSVars, {flag: 'w'});
  }

  /** Сохраняем тему для tailwind.config.js */
  function saveTWTheme(jsonTokens) {
    /**
     * Создать промежуточный JSON объект из теней, в котром будут ссылки на CSS переменные, пример:
     * {"boxShadowElevation2Dp": "var(--boxShadowElevation2Dp);"}
     * */
    function getShadowPaletteAsCSSVars(palette) {
      return Object.keys(palette).reduce((accumulator, current) => {
        accumulator[current] = `var(--${current});`;

        return accumulator;
      }, {});
    }

    const shadowColors = generateTokenColors({Elevation: jsonTokens.shadows.darkShadows}, 'boxShadow.');
    const boxShadow = getShadowPaletteAsCSSVars(shadowColors);

    const nonColorPalettes = {
      spacing: generateTokenColors({spacing: jsonTokens.spacing}, ''),
      borderRadius: generateTokenColors({borderRadius: jsonTokens.borderRadius}, ''),
      boxShadow,
    };

    const theme = Object.keys(themeKeysToVariableKeys).reduce((accumulator, current) => {
      const paletteKey = themeKeysToVariableKeys[current];
      accumulator[current] = nonColorPalettes[paletteKey];

      return accumulator;
    }, {});

    writeFileSync(tailwindThemeFile, JSON.stringify(theme, null, 2));
  }

  /** На основании полученного JSON создает файлы для Tailwind */
  function generateFiles(jsonTokens) {
    const tailwindBaseColors = generateTokenColors(jsonTokens.colors.baseColorsPalette, '');

    const tailwindDarkColors = generateTokenColors(jsonTokens.colors.darkThemePalette);
    writeFileSync(tailwindDarkColorsFile, JSON.stringify({...tailwindDarkColors, ...tailwindBaseColors}, null, 2));

    const tailwindLightColors = generateTokenColors(jsonTokens.colors.lightThemePalette);
    writeFileSync(tailwindLightColorsFile, JSON.stringify({...tailwindLightColors, ...tailwindBaseColors}, null, 2));

    saveCSSVars({
      tailwindLightColors,
      tailwindDarkColors,
      jsonTokens,
    });

    saveTokensDTS({...tailwindBaseColors, ...tailwindLightColors});

    saveTWClassNames(
      {...tailwindBaseColors, ...tailwindLightColors},
      jsonTokens.spacing,
      jsonTokens.borderRadius,
      jsonTokens.shadows.lightShadows,
    );

    saveTWTheme(jsonTokens);
  }

  /** Запускаем все фазы генерации */
  const jsonTokens = await combineAllTokensToJSON();
  generateFiles(jsonTokens);

  // Можно сохранить, чтоб подебажить результат
  // writeFileSync('design_tokens_resolved.json', JSON.stringify(jsonTokens, null, 2));
  console.log('Успешно сгенерировано!');
}

/** Вызов функции для генерации токенов и сохранения их в файлы */
parseTokensAndGenerateFiles();
