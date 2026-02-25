const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');

const { getAgentDefinition } = require('./agents');
const { ensureMarkdownFile, ensureDir, backupIfExists, syncFile } = require('./fs-utils');

async function rollbackBackup(destinationPath, backupPath) {
  if (!backupPath) {
    return;
  }

  try {
    await fs.rename(backupPath, destinationPath);
  } catch (_) {
    // 回滚失败时交给上层统一展示, 这里保持静默避免覆盖原始错误
  }
}

async function syncToAgents(targetFile, agentKeys, mode) {
  const sourcePath = await ensureMarkdownFile(targetFile);
  const results = [];

  for (const agentKey of agentKeys) {
    const definition = getAgentDefinition(agentKey);
    const agentRoot = path.join(os.homedir(), definition.rootDir);
    const destinationPath = path.join(agentRoot, definition.fileName);

    await ensureDir(agentRoot);

    let backupPath = null;
    try {
      backupPath = await backupIfExists(destinationPath);
      await syncFile(sourcePath, destinationPath, mode);

      results.push({
        ok: true,
        agentKey,
        agentName: definition.displayName,
        destinationPath,
        backupPath
      });
    } catch (error) {
      await rollbackBackup(destinationPath, backupPath);
      results.push({
        ok: false,
        agentKey,
        agentName: definition.displayName,
        destinationPath,
        backupPath,
        error
      });
    }
  }

  return results;
}

module.exports = {
  syncToAgents
};
