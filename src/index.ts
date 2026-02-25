import { Command } from "commander";
import chalk from "chalk";

import { parseAgents } from "./agents";
import { promptForAgents } from "./prompts";
import { SyncMode, syncToAgents, validateSourceMarkdown } from "./sync";

/**
 * 统一的 CLI 入口函数, 方便 bin 与测试复用。
 */
export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("ring1")
    .description("Sync markdown guidance files to agent user-scope locations")
    .version("0.3.0");

  program
    .command("sync <targetFile>")
    .description("Sync a target markdown file to agent directories")
    .option(
      "-a, --agents <agents...>",
      "Target agents: claude codex opencode gemini; prompt multi-select when omitted"
    )
    .option("-m, --mode <mode>", "Sync mode: link | copy", "link")
    .action(async (targetFile: string, options: { agents?: string[]; mode?: string }) => {
      const mode = String(options.mode || "link").toLowerCase();
      if (!isSyncMode(mode)) {
        console.error(chalk.red(`Error: Unsupported mode: ${options.mode}. Available: link, copy`));
        process.exitCode = 1;
        return;
      }

      try {
        const sourcePath = await validateSourceMarkdown(targetFile);
        const agents = options.agents
          ? parseAgents(options.agents)
          : await promptForAgents();
        const results = await syncToAgents(sourcePath, agents, mode);

        let failedCount = 0;
        for (const result of results) {
          if (!result.ok) {
            failedCount += 1;
            console.error(chalk.red(`✖ ${result.agent} sync failed -> ${result.destinationPath}`));
            console.error(chalk.red(`  Reason: ${result.error.message}`));
            continue;
          }

          console.log(chalk.green(`✔ ${result.agent} synced -> ${result.destinationPath}`));
          if (result.backupPath) {
            console.log(chalk.yellow(`  Backup created -> ${result.backupPath}`));
          }
          if (result.fallbackApplied) {
            console.log(chalk.yellow("  Windows link permission denied, auto-fallback to copy"));
          }
        }

        if (failedCount > 0) {
          process.exitCode = 1;
        }
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`Error: ${normalizedError.message}`));
        process.exitCode = 1;
      }
    });

  await program.parseAsync(argv);
}

if (require.main === module) {
  void runCli();
}

function isSyncMode(mode: string): mode is SyncMode {
  return mode === "link" || mode === "copy";
}
