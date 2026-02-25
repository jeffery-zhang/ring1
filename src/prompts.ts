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

  throw new Error("Missing --agents and current terminal is non-interactive. Please pass --agents explicitly.");
}

/**
 * 仅在 TTY 场景调用，允许用户手动多选同步目标。
 */
export async function promptForAgents(): Promise<AgentName[]> {
  ensureAgentsPromptSupported();

  const checkbox = await checkboxLoader();
  const selectedAgents = await checkbox({
    message: "Select agents to sync (Space to toggle, Enter to confirm)",
    choices: SUPPORTED_AGENTS.map((agent) => ({
      name: agent,
      value: agent,
      checked: false
    })),
    pageSize: SUPPORTED_AGENTS.length
  });

  if (selectedAgents.length === 0) {
    throw new Error("No agent selected. Please select at least one agent.");
  }

  return selectedAgents;
}
