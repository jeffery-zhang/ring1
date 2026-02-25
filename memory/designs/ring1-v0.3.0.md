# ring1 v0.3.0 设计方案

## 本版本定位

- 本版本基于 `v0.2.0` 做增量改造，不重写整体架构
- 目标是两件事:
  - 将 `AGENT_DEFINITIONS` 拆分到独立文件，便于后续扩展
  - 新增 `opencode` 支持，并保证跨平台路径兼容

## 相对 v0.2.0 的改造点

### 1) Agent 元数据拆分

- 新增独立元数据文件(建议): `src/agent-definitions.ts`
- 该文件仅负责维护 Agent 目录与目标文件名映射，不放业务流程
- `src/agents.ts` 保留输入解析与校验逻辑，改为依赖元数据文件
- `src/paths.ts` 改为从元数据文件读取路径片段，避免重复定义

### 2) 新增 opencode 支持

- 新增 Agent 标识: `opencode`
- 目标路径规则:
  - Unix-like: `~/.config/opencode/AGENTS.md`
  - Windows: `%USERPROFILE%\\.config\\opencode\\AGENTS.md`
- 在实现中统一使用 `path.join(homeDir, ".config", "opencode", "AGENTS.md")` 组装

### 3) CLI 行为扩展

- `--agents` 支持值增加 `opencode`
- 错误提示的可选值列表同步包含 `opencode`
- `sync` 执行汇总逻辑按现有机制扩展到三目标

## 兼容性与稳定性

- 继续保留 `link/copy` 双模式
- 继续保留 Windows 下 `link` 权限失败自动降级 `copy`
- 继续保留目标存在时先备份的策略

## 非目标

- 本版本不修改命令结构，不新增交互式参数
- 本版本不引入新的第三方依赖

## 待确认事项(开发前确认)

- 默认 `--agents` 是否从 `claude,codex` 扩展为 `claude,codex,opencode`
