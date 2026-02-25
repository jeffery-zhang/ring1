const fs = require('node:fs/promises');
const path = require('node:path');

function getTimestamp() {
  // 用可读时间戳保证备份文件可追溯
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join('') + '-' + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('');
}

async function ensureMarkdownFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  const extension = path.extname(resolvedPath).toLowerCase();

  if (extension !== '.md') {
    throw new Error('目标文件必须是 .md 文件。');
  }

  let stat;
  try {
    stat = await fs.stat(resolvedPath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`目标文件不存在: ${resolvedPath}`);
    }
    throw error;
  }

  if (!stat.isFile()) {
    throw new Error(`目标路径不是文件: ${resolvedPath}`);
  }

  return resolvedPath;
}

async function ensureDir(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function buildBackupFilePath(filePath) {
  const directory = path.dirname(filePath);
  const extension = path.extname(filePath) || '.md';
  const baseName = path.basename(filePath, extension);
  const timestamp = getTimestamp();

  return path.join(directory, `${baseName}.bak.${timestamp}${extension}`);
}

async function backupIfExists(filePath) {
  try {
    await fs.lstat(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  const backupPath = buildBackupFilePath(filePath);
  await fs.rename(filePath, backupPath);
  return backupPath;
}

async function syncFile(sourcePath, destinationPath, mode) {
  if (mode === 'copy') {
    await fs.copyFile(sourcePath, destinationPath);
    return;
  }

  if (mode === 'link') {
    // Windows 下对文件链接显式指定 file 类型, 兼容性更好
    await fs.symlink(sourcePath, destinationPath, 'file');
    return;
  }

  throw new Error(`不支持的同步模式: ${mode}`);
}

module.exports = {
  ensureMarkdownFile,
  ensureDir,
  backupIfExists,
  syncFile
};
