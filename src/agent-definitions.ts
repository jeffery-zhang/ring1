export interface AgentDefinition {
  targetPathSegments: readonly string[];
}

export const AGENT_DEFINITIONS = {
  claude: {
    targetPathSegments: [".claude", "CLAUDE.md"]
  },
  codex: {
    targetPathSegments: [".codex", "AGENTS.md"]
  },
  opencode: {
    targetPathSegments: [".config", "opencode", "AGENTS.md"]
  },
  gemini: {
    targetPathSegments: [".gemini", "GEMINI.md"]
  }
} as const satisfies Record<string, AgentDefinition>;

export type AgentName = keyof typeof AGENT_DEFINITIONS;

export const SUPPORTED_AGENTS = Object.keys(AGENT_DEFINITIONS) as AgentName[];
