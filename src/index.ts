import { Command } from "commander";

/**
 * 统一的 CLI 入口函数, 方便 bin 与测试复用。
 */
export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("ring1")
    .description("一键同步 Agent user scope 指导文件")
    .version("0.2.0");

  await program.parseAsync(argv);
}

if (require.main === module) {
  void runCli();
}
