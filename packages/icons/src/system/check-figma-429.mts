/**
 * Вывод в явном виде ошибки 429, а то figma-export этого сам не умеет.
 * Делается запрос до figma-export.
 */
import {spawn} from 'node:child_process';
import {readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';

const svgDir = resolve(process.cwd(), 'tmp/svgImported');
const figmaConfigPath = resolve(process.cwd(), '.figmaexportrc.js');
const require = createRequire(import.meta.url);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getFigmaFileIdFromConfig = (): string => {
  const loaded: unknown = require(figmaConfigPath);
  const config = isRecord(loaded) && 'default' in loaded ? loaded.default : loaded;

  if (!isRecord(config) || !Array.isArray(config.commands)) {
    throw new Error(`Не удалось прочитать commands из "${figmaConfigPath}".`);
  }

  for (const command of config.commands) {
    if (!Array.isArray(command) || command.length < 2) continue;
    const [commandName, commandOptions] = command as [unknown, unknown];
    if (commandName !== 'components') continue;

    const options = commandOptions;
    if (!isRecord(options)) continue;

    const fileId = options.fileId;
    if (typeof fileId === 'string' && fileId.length > 0) {
      return fileId;
    }
  }

  throw new Error(`Не удалось прочитать components.fileId из "${figmaConfigPath}".`);
};

const FIGMA_FILE_ID = getFigmaFileIdFromConfig();

const parseRetryAfter = (rawValue: string | null): number | null => {
  if (!rawValue) return null;

  const asNumber = Number(rawValue);
  if (Number.isFinite(asNumber)) return asNumber;

  const asDate = new Date(rawValue);
  if (!Number.isNaN(asDate.getTime())) {
    return Math.ceil((asDate.getTime() - Date.now()) / 1000);
  }

  return null;
};

const pluralRu = (value: number, forms: [string, string, string]): string => {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
};

const formatRetryIn = (totalSeconds: number): string => {
  const totalHours = Math.ceil(Math.max(0, totalSeconds) / 3600);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${pluralRu(days, ['день', 'дня', 'дней'])}`);
  if (hours > 0) parts.push(`${hours} ${pluralRu(hours, ['час', 'часа', 'часов'])}`);

  if (parts.length === 0) {
    return `1 ${pluralRu(1, ['час', 'часа', 'часов'])}`;
  }

  return parts.join(' ');
};

const formatRetryDateRu = (date: Date): string => {
  const dayMonth = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long'}).format(date);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${dayMonth} ${hh}:${mm}`;
};

const runFigmaExport = async (): Promise<void> =>
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('figma-export', ['use-config'], {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.once('error', rejectPromise);
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`figma-export завершился с кодом ${code ?? 'unknown'}`));
    });
  });

const hasImportedSvgs = async (): Promise<boolean> => {
  try {
    const files = await readdir(svgDir);
    return files.length > 0;
  } catch {
    return false;
  }
};

const buildRateLimitMessage = (retryAfterSeconds: number, headers: Headers): string => {
  const retryAt = new Date(Date.now() + retryAfterSeconds * 1000);
  const planTier = headers.get('x-figma-plan-tier') ?? 'неизвестно';
  const limitType = headers.get('x-figma-rate-limit-type') ?? 'неизвестно';
  const recommendations =
    limitType === 'low'
      ? 'Скорее всего, уперлись в лимиты тарифа/seat (не burst-лимит). Обычно помогает токен от аккаунта с более высоким планом или ожидание до окна сброса.'
      : 'Похоже на временный API-лимит. Подождите до времени ниже и повторите запуск.';
  const retryDate = formatRetryDateRu(retryAt);
  const retryIn = formatRetryIn(retryAfterSeconds);

  return `Ошибка: Figma API вернул 429 (rate limit). Повторить через ${retryIn} (после ${retryDate})
План: ${planTier}, тип лимита: ${limitType}.
${recommendations}`;
};

const fetchFileInfo = async (): Promise<Response> => {
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    throw new Error('Не задан FIGMA_TOKEN. Без токена экспорт из Figma невозможен.');
  }

  return await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE_ID}`, {
    headers: {'X-Figma-Token': token},
  });
};

const assertNoRateLimitBeforeImport = async (): Promise<void> => {
  const response = await fetchFileInfo();

  if (response.status === 429) {
    const retryRaw = response.headers.get('retry-after');
    const retryAfterSeconds = parseRetryAfter(retryRaw);
    const suffix = retryAfterSeconds
      ? buildRateLimitMessage(retryAfterSeconds, response.headers)
      : `Figma API вернул 429 (rate limit). Заголовок Retry-After: ${retryRaw ?? 'отсутствует'}`;

    throw new Error(suffix);
  }

  if (!response.ok) {
    throw new Error(`Проверка Figma API не прошла: статус ${response.status} ${response.statusText}.`);
  }
};

const diagnoseImportFailure = async (): Promise<never> => {
  const response = await fetchFileInfo();

  if (response.status === 429) {
    const retryRaw = response.headers.get('retry-after');
    const retryAfterSeconds = parseRetryAfter(retryRaw);
    const suffix = retryAfterSeconds
      ? buildRateLimitMessage(retryAfterSeconds, response.headers)
      : `Figma API вернул 429 (rate limit). Заголовок Retry-After: ${retryRaw ?? 'отсутствует'}`;

    throw new Error(`Шаг импорта не создал "${svgDir}". ${suffix}.`);
  }

  if (!response.ok) {
    throw new Error(
      `Шаг импорта не создал "${svgDir}". Проверка Figma API не прошла: статус ${response.status} ${response.statusText}.`,
    );
  }

  throw new Error(
    `Шаг импорта не создал "${svgDir}", хотя API файла доступен. Проверьте настройки figma-export (fileId, onlyFromPages/ids, output).`,
  );
};

await assertNoRateLimitBeforeImport();
await runFigmaExport();

if (!(await hasImportedSvgs())) {
  await diagnoseImportFailure();
}
