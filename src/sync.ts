import fs from "node:fs/promises";
import path from "node:path";

import { AgentName } from "./agents";
import { resolveAgentTargetPath } from "./paths";

export type SyncMode = "link" | "copy";

export interface SyncSuccessResult {
  agent: AgentName;
  destinationPath: string;
  backupPath?: string;
  usedMode: SyncMode;
  fallbackApplied: boolean;
  ok: true;
}

export interface SyncFailedResult {
  agent: AgentName;
  destinationPath: string;
  error: Error;
  ok: false;
}

export type SyncResult = SyncSuccessResult | SyncFailedResult;

export async function validateSourceMarkdown(targetFile: string): Promise<string> {
  if (!targetFile || targetFile.trim().length === 0) {
    throw new Error("Target file cannot be empty.");
  }

  const resolvedPath = path.resolve(targetFile);
  if (path.extname(resolvedPath).toLowerCase() !== ".md") {
    throw new Error("Only .md files are supported.");
  }

  const stat = await fs.stat(resolvedPath).catch(() => undefined);
  if (!stat || !stat.isFile()) {
    throw new Error(`Target file does not exist or is not a regular file: ${resolvedPath}`);
  }

  return resolvedPath;
}

function formatBackupTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function resolveBackupPath(destinationPath: string): Promise<string> {
  const parsed = path.parse(destinationPath);
  const baseName =
    parsed.ext.toLowerCase() === ".md" ? parsed.name : parsed.base;

  // 避免并发或重复执行导致备份文件名冲突。
  let suffix = 0;
  while (true) {
    const timestamp = formatBackupTimestamp();
    const extra = suffix === 0 ? "" : `.${suffix}`;
    const candidate = path.join(
      parsed.dir,
      `${baseName}.bak.${timestamp}${extra}.md`
    );

    const exists = await fs
      .access(candidate)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      return candidate;
    }

    suffix += 1;
  }
}

async function backupIfExists(destinationPath: string): Promise<string | undefined> {
  const exists = await fs
    .lstat(destinationPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    return undefined;
  }

  const backupPath = await resolveBackupPath(destinationPath);
  await fs.rename(destinationPath, backupPath);
  return backupPath;
}

function shouldWindowsFallback(error: NodeJS.ErrnoException): boolean {
  if (process.platform !== "win32") {
    return false;
  }

  return ["EPERM", "EACCES", "ENOTSUP", "EINVAL", "UNKNOWN"].includes(
    String(error.code || "")
  );
}

async function executeSync(
  sourcePath: string,
  destinationPath: string,
  mode: SyncMode
): Promise<{ usedMode: SyncMode; fallbackApplied: boolean }> {
  if (mode === "copy") {
    await fs.copyFile(sourcePath, destinationPath);
    return { usedMode: "copy", fallbackApplied: false };
  }

  try {
    await fs.symlink(sourcePath, destinationPath);
    return { usedMode: "link", fallbackApplied: false };
  } catch (error) {
    const normalizedError =
      error instanceof Error ? (error as NodeJS.ErrnoException) : new Error(String(error));
    if (!shouldWindowsFallback(normalizedError)) {
      throw normalizedError;
    }

    await fs.copyFile(sourcePath, destinationPath);
    return { usedMode: "copy", fallbackApplied: true };
  }
}

export async function syncToAgent(
  sourcePath: string,
  agent: AgentName,
  mode: SyncMode
): Promise<SyncResult> {
  const destinationPath = resolveAgentTargetPath(agent);

  try {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    const backupPath = await backupIfExists(destinationPath);
    const executeResult = await executeSync(sourcePath, destinationPath, mode);

    return {
      agent,
      destinationPath,
      backupPath,
      usedMode: executeResult.usedMode,
      fallbackApplied: executeResult.fallbackApplied,
      ok: true
    };
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    return {
      agent,
      destinationPath,
      error: normalizedError,
      ok: false
    };
  }
}

export async function syncToAgents(
  sourcePath: string,
  agents: AgentName[],
  mode: SyncMode
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const agent of agents) {
    results.push(await syncToAgent(sourcePath, agent, mode));
  }
  return results;
}
