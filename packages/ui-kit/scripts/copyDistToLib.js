/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Vite не умеет в нормальный devMode + HMR, он:
 * 1) очищает dist
 * 2) при пересборке не восстанавливает assets
 * И это ведет к тому, что в проектах кит исчезает и они ломаются.
 *
 * Данный хак исправляет эту ошибку: vite собирает все в папку dist,
 * а nodemon смотрит на изменения в этой папке и копирует все новые файлы в lib
 */

const fs = require('fs').promises;
const path = require('path');

async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
}

async function copyFolderRecursive(src, dest) {
  await fs.mkdir(dest, {recursive: true});
  const entries = await fs.readdir(src, {withFileTypes: true});

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyFolderRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function copyFolder(src, dest) {
  try {
    await copyFolderRecursive(src, dest);
    // eslint-disable-next-line no-console
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying folder: ${err}`);
  }
}

const sourceFolder = path.join(__dirname, '../dist');
const destinationFolder = path.join(__dirname, '../lib');

copyFolder(sourceFolder, destinationFolder);
