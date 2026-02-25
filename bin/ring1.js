#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');

const { parseAgents } = require('../src/agents');
const { syncToAgents } = require('../src/sync');

const program = new Command();

program
  .name('ring1')
  .description('一键同步 Agent user scope 指导文件')
  .version('0.1.0');

program
  .command('sync <targetFile>')
  .description('将目标 md 文件同步到多个 Agent 根目录')
  .requiredOption('-a, --agents <agents...>', '目标 Agent, 例如: codex claude gemini')
  .option('-m, --mode <mode>', '同步模式: link | copy', 'link')
  .action(async (targetFile, options) => {
    const mode = String(options.mode || '').toLowerCase();

    if (!['link', 'copy'].includes(mode)) {
      console.error(chalk.red(`错误: 不支持的 mode: ${options.mode}。可选值: link, copy`));
      process.exitCode = 1;
      return;
    }

    try {
      const agents = parseAgents(options.agents);
      const results = await syncToAgents(targetFile, agents, mode);

      let failedCount = 0;
      for (const result of results) {
        if (result.ok) {
          console.log(chalk.green(`✔ ${result.agentName} 同步成功 -> ${result.destinationPath}`));
          if (result.backupPath) {
            console.log(chalk.yellow(`  备份已生成 -> ${result.backupPath}`));
          }
          continue;
        }

        failedCount += 1;
        console.error(chalk.red(`✖ ${result.agentName} 同步失败 -> ${result.destinationPath}`));
        console.error(chalk.red(`  原因: ${result.error.message}`));
      }

      if (failedCount > 0) {
        process.exitCode = 1;
      }
    } catch (error) {
      console.error(chalk.red(`错误: ${error.message}`));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
