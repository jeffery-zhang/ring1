import { AgentName, SUPPORTED_AGENTS } from "./agent-definitions";

type CheckboxPrompt = (config: {
  message: string;
  choices: Array<{ name: string; value: AgentName; checked: boolean }>;
  pageSize: number;
}) => Promise<AgentName[]>;

function isInteractiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

let checkboxLoader: () => Promise<CheckboxPrompt> = async () => {
  const { checkbox } = await import("@inquirer/prompts");
  return checkbox as CheckboxPrompt;
};

/**
 * 仅用于测试场景注入交互实现，避免真实等待终端输入。
 */
export function setCheckboxLoaderForTest(
  loader: () => Promise<CheckboxPrompt>
): void {
  checkboxLoader = loader;
}

export function ensureAgentsPromptSupported(): void {
  if (isInteractiveTerminal()) {
    return;
  }

  throw new Error("缺少 --agents 且当前不是交互终端，请显式传入 --agents。");
}

/**
 * 仅在 TTY 场景调用，允许用户手动多选同步目标。
 */
export async function promptForAgents(): Promise<AgentName[]> {
  ensureAgentsPromptSupported();

  const checkbox = await checkboxLoader();
  const selectedAgents = await checkbox({
    message: "请选择要同步的 agents（空格勾选，回车提交）",
    choices: SUPPORTED_AGENTS.map((agent) => ({
      name: agent,
      value: agent,
      checked: false
    })),
    pageSize: SUPPORTED_AGENTS.length
  });

  if (selectedAgents.length === 0) {
    throw new Error("未选择任何 agent，请至少选择一个后再提交。");
  }

  return selectedAgents;
}
