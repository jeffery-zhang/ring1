import { Command } from "commander";
import chalk from "chalk";

import { parseAgents } from "./agents";
import { SyncMode, syncToAgents, validateSourceMarkdown } from "./sync";

/**
 * 统一的 CLI 入口函数, 方便 bin 与测试复用。
 */
export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("ring1")
    .description("一键同步 Agent user scope 指导文件")
    .version("0.2.0");

  program
    .command("sync <targetFile>")
    .description("将目标 md 文件同步到 Agent 根目录")
    .option(
      "-a, --agents <agents...>",
      "目标 Agent，支持: claude codex，默认同时同步"
    )
    .option("-m, --mode <mode>", "同步模式: link | copy", "link")
    .action(async (targetFile: string, options: { agents?: string[]; mode?: string }) => {
      const mode = String(options.mode || "link").toLowerCase();
      if (!isSyncMode(mode)) {
        console.error(chalk.red(`错误: 不支持的 mode: ${options.mode}。可选值: link, copy`));
        process.exitCode = 1;
        return;
      }

      try {
        const sourcePath = await validateSourceMarkdown(targetFile);
        const agents = parseAgents(options.agents);
        const results = await syncToAgents(sourcePath, agents, mode);

        let failedCount = 0;
        for (const result of results) {
          if (!result.ok) {
            failedCount += 1;
            console.error(chalk.red(`✖ ${result.agent} 同步失败 -> ${result.destinationPath}`));
            console.error(chalk.red(`  原因: ${result.error.message}`));
            continue;
          }

          console.log(chalk.green(`✔ ${result.agent} 同步成功 -> ${result.destinationPath}`));
          if (result.backupPath) {
            console.log(chalk.yellow(`  备份已生成 -> ${result.backupPath}`));
          }
          if (result.fallbackApplied) {
            console.log(chalk.yellow("  Windows link 权限受限，已自动降级为 copy"));
          }
        }

        if (failedCount > 0) {
          process.exitCode = 1;
        }
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        console.error(chalk.red(`错误: ${normalizedError.message}`));
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
