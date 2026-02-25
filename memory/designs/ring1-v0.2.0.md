# ring1 v0.2.0 设计方案

## 本版本定位

- 本版本相对 0.1.0 为重构版本: 现有实现视为废弃, 代码从零重建
- 目标是先完成最小可用 CLI: 用一个源 Markdown 文件同步到 Claude Code 与 Codex

## 相对 v0.1.0 的核心改造

### 1) 技术栈改造: JavaScript -> TypeScript

- 旧实现(.js)不再延续, 新实现统一使用 TypeScript
- 构建保持极简: 使用 	sc 产出可执行代码, 不引入额外打包器

### 2) Agent 范围收敛: 仅支持 Claude 与 Codex

- 删除 gemini 相关设计与实现
- 支持的目标仅保留:
  - claude -> CLAUDE.md
  - codex -> AGENTS.md

### 3) 目标路径改造: 明确跨平台落点

- claude 目标文件:
  - Unix-like: ~/.claude/CLAUDE.md
  - Windows: %USERPROFILE%\.claude\CLAUDE.md
- codex 目标文件:
  - Unix-like: ~/.codex/AGENTS.md
  - Windows: %USERPROFILE%\.codex\AGENTS.md
- 实现策略:
  - 优先使用 os.homedir() 解析 home 目录
  - 使用 path.join() 组装路径, 避免硬编码分隔符

### 4) 命令面保持最小化

- 保留单命令模型: ing1 sync <targetFile>
- --agents 仅允许 claude、codex
- 继续保留 --mode <link|copy> 以兼容旧使用习惯, 默认 link

## 兼容性设计

- Windows 软链接权限受限时, 输出明确错误并建议切换 --mode copy
- 所有文件系统操作通过 Node s/promises + 统一错误包装, 保证错误可读
- 所有路径在执行前标准化并输出调试友好的目标绝对路径

## 保留不变项

- 输入仍限定为 .md 文件
- 目标文件已存在时先备份, 再执行同步
- 多目标执行允许部分失败, 最终统一汇总并用非 0 退出码表示失败

## 非目标

- 本版本不新增交互式 UI
- 本版本不支持第三个 Agent

## 待确认事项(开发前必须确认)

- --agents 默认值是否应为同时同步 claude,codex?
- link 在 Windows 失败时, 是否需要自动降级为 copy(还是仅提示用户手动切换)?
