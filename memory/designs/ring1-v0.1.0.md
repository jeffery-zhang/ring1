# ring1 v0.1.0 设计方案

## 本版本目标

- 提供 `ring1 sync <目标文件>` 命令, 将任意 Markdown 指导文件同步到多个 AI Agent 工具的 user scope 目录
- 支持多选目标 Agent: `codex`, `claude`, `gemini`
- 默认自动命名目标文件:
  - `codex` -> `AGENTS.md`
  - `claude` -> `CLAUDE.md`
  - `gemini` -> `GEMINI.md`
- 如果目标目录存在同名文件, 自动备份为 `<原文件名>.bak.<timestamp>.md`
- 使用 `commander` 解析命令, `chalk` 输出彩色日志

## 范围与边界

- 只处理 `.md` 文件
- 同步方式支持两种:
  - `link` (默认): 软链接
  - `copy`: 直接复制
- 目标目录固定为用户家目录下:
  - `~/.codex`
  - `~/.claude`
  - `~/.gemini`
- 本版本不做交互式 UI, 通过命令参数选择 Agent

## 命令设计

```bash
ring1 sync <targetFile> --agents codex claude --mode link
```

- `--agents <agents...>`: 多个 Agent 标识, 支持空格分隔和逗号分隔
- `--mode <link|copy>`: 同步模式, 默认 `link`

## 核心流程

1. 校验输入文件存在且扩展名为 `.md`
2. 解析 Agent 列表并去重, 校验是否在支持名单内
3. 按 Agent 生成目标目录与目标文件名
4. 若目标文件已存在:
   - 计算备份文件名 `<basename>.bak.<timestamp>.md`
   - 将原文件重命名为备份文件
5. 根据 `mode` 执行:
   - `link`: 创建符号链接
   - `copy`: 复制文件
6. 输出成功/失败汇总, 任一失败时返回非 0 退出码

## 实现结构

- `bin/ring1.js`: CLI 入口
- `src/agents.js`: Agent 定义与解析
- `src/sync.js`: 同步主逻辑
- `src/fs-utils.js`: 文件系统工具(校验、备份名、软链/复制)

## 风险与处理

- Windows 创建软链可能受权限限制: 给出清晰错误提示并建议切换 `--mode copy`
- 用户输入 Agent 拼写错误: 给出支持列表
- 多 Agent 部分失败: 保持其他 Agent 继续执行, 最后统一汇总
