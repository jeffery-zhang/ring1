export type AgentName = "claude" | "codex";

export interface AgentDefinition {
  name: AgentName;
  directoryName: ".claude" | ".codex";
  fileName: "CLAUDE.md" | "AGENTS.md";
}

export const AGENT_DEFINITIONS: Record<AgentName, AgentDefinition> = {
  claude: {
    name: "claude",
    directoryName: ".claude",
    fileName: "CLAUDE.md"
  },
  codex: {
    name: "codex",
    directoryName: ".codex",
    fileName: "AGENTS.md"
  }
};

export const SUPPORTED_AGENTS: AgentName[] = ["claude", "codex"];
