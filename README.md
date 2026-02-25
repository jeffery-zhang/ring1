# @jingoz/ring1

`ring1` 是一个 Node.js CLI, 用于把任意 Markdown 指导文件一键同步到多个 Agent 工具的 user scope 目录。

## 安装

```bash
npm install
npm link
```

## 使用

```bash
ring1 sync <targetFile> --agents <agent...> [--mode link|copy]
```

### 参数说明

- `<targetFile>`: 要同步的 `.md` 文件
- `--agents`: 目标 Agent, 支持多选: `codex`, `claude`, `gemini`
- `--mode`: 同步模式
  - `link`(默认): 创建软链接
  - `copy`: 直接复制文件

### 自动命名规则

- `codex` -> `~/.codex/AGENTS.md`
- `claude` -> `~/.claude/CLAUDE.md`
- `gemini` -> `~/.gemini/GEMINI.md`

### 备份规则

如果目标目录已存在同名文件, 会先重命名为:

- `AGENTS.bak.<timestamp>.md`
- `CLAUDE.bak.<timestamp>.md`
- `GEMINI.bak.<timestamp>.md`

### 示例

```bash
ring1 sync ./my-guide.md --agents codex claude
ring1 sync ./my-guide.md --agents codex,gemini --mode copy
```
