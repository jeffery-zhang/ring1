import os from "node:os";
import path from "node:path";

import { AGENT_DEFINITIONS, AgentName } from "./agents";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * 统一 home 目录解析逻辑, 先走 os.homedir() 再走环境变量兜底。
 */
export function resolveHomeDir(): string {
  const homeFromOs = os.homedir().trim();
  if (homeFromOs.length > 0) {
    return path.resolve(homeFromOs);
  }

  const fallback =
    readEnv("HOME") ??
    readEnv("USERPROFILE") ??
    joinWindowsHome(readEnv("HOMEDRIVE"), readEnv("HOMEPATH"));
  if (!fallback) {
    throw new Error("无法解析用户 home 目录，请检查 HOME/USERPROFILE 环境变量。");
  }

  return path.resolve(fallback);
}

function joinWindowsHome(drive?: string, homePath?: string): string | undefined {
  if (!drive || !homePath) {
    return undefined;
  }

  return `${drive}${homePath}`;
}

/**
 * 生成目标 Agent 的绝对路径, 避免调用侧重复拼接。
 */
export function resolveAgentTargetPath(agent: AgentName): string {
  const homeDir = resolveHomeDir();
  const definition = AGENT_DEFINITIONS[agent];

  return path.resolve(homeDir, definition.directoryName, definition.fileName);
}
