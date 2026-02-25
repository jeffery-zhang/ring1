import { AgentName, SUPPORTED_AGENTS } from "./agent-definitions";

export type { AgentName };
export { SUPPORTED_AGENTS };

export function parseAgents(rawAgents?: string[] | string): AgentName[] {
  if (!rawAgents) {
    return [...SUPPORTED_AGENTS];
  }

  const rawList = Array.isArray(rawAgents) ? rawAgents : [rawAgents];
  const parsed = rawList
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  if (parsed.length === 0) {
    return [...SUPPORTED_AGENTS];
  }

  const uniqueValues = [...new Set(parsed)];
  const unknownAgents = uniqueValues.filter(
    (item) => !SUPPORTED_AGENTS.includes(item as AgentName)
  );
  if (unknownAgents.length > 0) {
    throw new Error(
      `不支持的 agents: ${unknownAgents.join(", ")}。可选值: ${SUPPORTED_AGENTS.join(", ")}`
    );
  }

  return uniqueValues as AgentName[];
}
