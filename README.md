# @jingoz/ring1

`ring1` 是一个 TypeScript CLI, 用于把 Markdown 指导文件同步到 Agent 工具的 user scope 目录。

## 安装

```bash
npm install
npm run build
npm link
```

## 使用

```bash
ring1 sync <targetFile> [--agents <agent...>] [--mode link|copy]
```

### 参数说明

- `<targetFile>`: 要同步的 `.md` 文件
- `--agents`: 目标 Agent, 支持: `claude`, `codex`, `opencode`
  - 传入时按参数执行（支持空格/逗号分隔）
  - 未传时:
    - TTY 环境弹出多选（空格勾选，回车提交）
    - 默认不预选，若空提交会报错
    - 非 TTY 环境直接报错并要求显式传参
- `--mode`: 同步模式（默认 `link`）
  - `link`: 创建软链接
  - `copy`: 直接复制文件

### 自动命名规则

- `codex` -> `~/.codex/AGENTS.md`
- `claude` -> `~/.claude/CLAUDE.md`
- `opencode` -> `~/.config/opencode/AGENTS.md`

在 Windows 上等价路径为:

- `%USERPROFILE%\\.codex\\AGENTS.md`
- `%USERPROFILE%\\.claude\\CLAUDE.md`
- `%USERPROFILE%\\.config\\opencode\\AGENTS.md`

### 备份规则

如果目标目录已存在同名文件, 会先重命名为:

- `AGENTS.bak.<timestamp>.md`
- `CLAUDE.bak.<timestamp>.md`
- `AGENTS.bak.<timestamp>.md` (opencode)

### Windows 兼容行为

- 当 `--mode link` 在 Windows 下因权限失败时, 会自动降级为 `copy`
- 同步日志会输出降级提示, 不需要手动重试

### 示例

```bash
ring1 sync ./my-guide.md --agents codex claude
ring1 sync ./my-guide.md --agents opencode --mode copy
ring1 sync ./my-guide.md
```
