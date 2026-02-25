const AGENT_DEFINITIONS = {
  codex: {
    key: 'codex',
    rootDir: '.codex',
    fileName: 'AGENTS.md',
    displayName: 'Codex'
  },
  claude: {
    key: 'claude',
    rootDir: '.claude',
    fileName: 'CLAUDE.md',
    displayName: 'Claude Code'
  },
  gemini: {
    key: 'gemini',
    rootDir: '.gemini',
    fileName: 'GEMINI.md',
    displayName: 'Gemini CLI'
  }
};

const AGENT_ALIASES = {
  codex: 'codex',
  claude: 'claude',
  'claude-code': 'claude',
  claudecode: 'claude',
  gemini: 'gemini',
  'gemini-cli': 'gemini'
};

function normalizeAgentInput(agentValues) {
  return agentValues
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function parseAgents(agentValues) {
  const normalized = normalizeAgentInput(agentValues || []);

  if (!normalized.length) {
    throw new Error('请通过 --agents 指定至少一个目标 Agent。');
  }

  const invalidAgents = [];
  const parsedAgents = [];

  for (const rawAgent of normalized) {
    const parsedAgent = AGENT_ALIASES[rawAgent];
    if (!parsedAgent) {
      invalidAgents.push(rawAgent);
      continue;
    }

    if (!parsedAgents.includes(parsedAgent)) {
      parsedAgents.push(parsedAgent);
    }
  }

  if (invalidAgents.length) {
    const validAgents = Object.keys(AGENT_DEFINITIONS).join(', ');
    throw new Error(`不支持的 Agent: ${invalidAgents.join(', ')}。可选值: ${validAgents}`);
  }

  return parsedAgents;
}

function getAgentDefinition(agentKey) {
  const definition = AGENT_DEFINITIONS[agentKey];
  if (!definition) {
    throw new Error(`未知 Agent: ${agentKey}`);
  }

  return definition;
}

module.exports = {
  AGENT_DEFINITIONS,
  parseAgents,
  getAgentDefinition
};
