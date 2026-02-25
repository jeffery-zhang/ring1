import { AgentName, SUPPORTED_AGENTS } from "./agent-definitions";

export type { AgentName };
export { SUPPORTED_AGENTS };

export function parseAgents(rawAgents: string[] | string): AgentName[] {
  const rawList = Array.isArray(rawAgents) ? rawAgents : [rawAgents];
  const parsed = rawList
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  if (parsed.length === 0) {
    throw new Error("Agents cannot be empty. Please select at least one agent.");
  }

  const uniqueValues = [...new Set(parsed)];
  const unknownAgents = uniqueValues.filter(
    (item) => !SUPPORTED_AGENTS.includes(item as AgentName)
  );
  if (unknownAgents.length > 0) {
    throw new Error(
      `Unsupported agents: ${unknownAgents.join(", ")}. Available: ${SUPPORTED_AGENTS.join(", ")}`
    );
  }

  return uniqueValues as AgentName[];
}
