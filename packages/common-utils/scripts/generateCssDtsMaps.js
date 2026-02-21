/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const {globSync} = require('glob');

/**
 * Универсальный скрипт для генерации .module.d.ts.map файлов
 * Использование: node generateCssDtsMaps.js [--watch] [--src-dir <путь>] [--root <путь>]
 * По умолчанию: root = process.cwd(), src-dir = path.join(root, 'src')
 */

function getArgs() {
  const args = process.argv.slice(2);

  const result = {
    watch: false,
    srcDir: null,
    root: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--watch') {
      result.watch = true;
    } else if (arg === '--src-dir' && i + 1 < args.length) {
      result.srcDir = args[++i];
    } else if (arg === '--root' && i + 1 < args.length) {
      result.root = args[++i];
    }
  }

  // Если srcDir не указан, используем стандартный путь
  if (!result.srcDir) {
    result.srcDir = path.join(result.root, 'src');
  }

  return result;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const DTS_CLASS_EXPORT_RE =
  /^\s*(?:readonly\s+"[^"]+"\s*:\s*string;|export declare const\s+[A-Za-z0-9_-]+\s*:\s*string;)\s*$/m;

function encodeVlq(value) {
  let vlq = value < 0 ? (-value << 1) + 1 : value << 1;
  let encoded = '';

  do {
    let digit = vlq & 31;
    vlq >>>= 5;

    if (vlq > 0) {
      digit |= 32;
    }

    encoded += BASE64_CHARS[digit];
  } while (vlq > 0);

  return encoded;
}

function buildMappings(dtsLines, classLineByName) {
  const mappingsByLine = new Array(dtsLines.length).fill('');
  const propertyRe = /^\s*readonly\s+"([^"]+)"\s*:\s*string;/;

  for (let i = 0; i < dtsLines.length; i += 1) {
    const match = dtsLines[i].match(propertyRe);

    if (!match) {
      continue;
    }

    const className = match[1];
    const cssLine = classLineByName.get(className);

    if (cssLine === undefined) {
      continue;
    }

    mappingsByLine[i] = {cssLine};
  }

  let prevSource = 0;
  let prevSourceLine = 0;
  let prevSourceColumn = 0;

  const mappings = mappingsByLine.map((entry) => {
    if (!entry) {
      return '';
    }

    const generatedColumn = 0;
    const source = 0;
    const sourceLine = entry.cssLine;
    const sourceColumn = 0;

    const segment =
      encodeVlq(generatedColumn) +
      encodeVlq(source - prevSource) +
      encodeVlq(sourceLine - prevSourceLine) +
      encodeVlq(sourceColumn - prevSourceColumn);

    prevSource = source;
    prevSourceLine = sourceLine;
    prevSourceColumn = sourceColumn;

    return segment;
  });

  return mappings.join(';');
}

function buildClassLineMap(cssContent) {
  const classLineByName = new Map();
  const lines = cssContent.split('\n');
  const classRe = /^\s*\.([A-Za-z0-9_-]+)\b/;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(classRe);

    if (!match) {
      continue;
    }

    const className = match[1];

    if (!classLineByName.has(className)) {
      classLineByName.set(className, i);
    }
  }

  return classLineByName;
}

function ensureMap(dtsPath) {
  const cssPath = dtsPath.replace(/\.d\.ts$/, '');
  const mapPath = `${dtsPath}.map`;
  const mapFileName = path.basename(mapPath);
  const cssFileName = path.basename(cssPath);

  let dtsContent = fs.readFileSync(dtsPath, 'utf8');

  // Protect against race with typed-scss-modules writes: skip transient invalid .d.ts states.
  if (!DTS_CLASS_EXPORT_RE.test(dtsContent)) {
    return;
  }

  const mappingComment = `//# sourceMappingURL=${mapFileName}`;

  if (!dtsContent.includes(mappingComment)) {
    if (!dtsContent.endsWith('\n')) {
      dtsContent += '\n';
    }

    dtsContent += `${mappingComment}\n`;
    fs.writeFileSync(dtsPath, dtsContent, 'utf8');
  }

  const dtsLines = dtsContent.split('\n');

  let mappings = '';

  if (fs.existsSync(cssPath)) {
    try {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      const classLineByName = buildClassLineMap(cssContent);
      mappings = buildMappings(dtsLines, classLineByName);
    } catch (error) {
      console.warn(`[genCssDtsMaps] Failed to read CSS for ${dtsPath}:`, error);
    }
  }

  const map = {
    version: 3,
    file: path.basename(dtsPath),
    sources: [cssFileName],
    names: [],
    mappings,
  };

  fs.writeFileSync(mapPath, JSON.stringify(map), 'utf8');
}

function handleChange(filePath, srcDir) {
  const DTS_RE = /\.module\.(css|scss)\.d\.ts$/;

  if (!filePath || !DTS_RE.test(filePath)) {
    return;
  }

  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    ensureMap(filePath, srcDir);
  } catch (error) {
    console.warn(`[genCssDtsMaps] Failed for ${filePath}:`, error);
  }
}

function runOnce(srcDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`[genCssDtsMaps] Source directory does not exist: ${srcDir}`);

    return;
  }

  const DTS_GLOB = '**/*.module.@(css|scss).d.ts';
  const dtsFiles = globSync(DTS_GLOB, {cwd: srcDir, absolute: true});

  dtsFiles.forEach((dtsPath) => handleChange(dtsPath, srcDir));
}

function watch(srcDir) {
  runOnce(srcDir);

  try {
    fs.watch(srcDir, {recursive: true}, (_eventType, filename) => {
      if (!filename) {
        return;
      }

      handleChange(path.join(srcDir, filename), srcDir);
    });

  } catch (error) {
    console.warn('[genCssDtsMaps] fs.watch recursive failed:', error);
  }
}

function main() {
  const args = getArgs();

  if (args.watch) {
    watch(args.srcDir);
  } else {
    runOnce(args.srcDir);
  }
}

if (require.main === module) {
  main();
}

module.exports = {runOnce, watch};
