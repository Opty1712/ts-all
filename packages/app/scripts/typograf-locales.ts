import fs from 'fs';
import path from 'path';
import Typograf from 'typograf';

interface FileConfig {
  name: string;
  locale: Array<string>;
}

const localesDir = './src/i18n/locales';

const files: Array<FileConfig> = [
  {name: 'ru.json', locale: ['ru']},
  {name: 'en.json', locale: ['en-US']},
  // { name: 'cn.json', locale: ['zh-CN'] }, // на потом
];

files.forEach(({name, locale}) => {
  /** прогоняем типограф */
  const filePath = path.join(localesDir, name);

  if (!fs.existsSync(filePath)) return;

  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const tp = new Typograf({locale});

  for (const key in jsonData) {
    if (jsonData[key] !== '') {
      jsonData[key] = tp.execute(jsonData[key]);
    }
  }

  /** сохраняем финальный результат */
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2) + '\n', 'utf-8');
});

// eslint-disable-next-line no-console
console.log('Локали обработаны');
