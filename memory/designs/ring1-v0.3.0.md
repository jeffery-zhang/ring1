# ring1 v0.3.0 设计方案

## 本版本定位

- 本版本基于 `v0.2.0` 做增量改造，不重写整体架构
- 目标有三项:
  - 将 `AGENT_DEFINITIONS` 拆分到独立文件，便于后续扩展
  - 新增 `opencode` 支持，并保证跨平台路径兼容
  - 增加缺省参数时的交互式选择能力

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

### 3) agents 支持列表扩展

- 支持列表从 `claude,codex` 扩展为 `claude,codex,opencode`

### 4) 参数选择规则(更新)

- 当用户未传 `--agents` 时:
  - 弹出多选列表
  - 支持空格勾选、回车提交
  - 候选项: `claude`、`codex`、`opencode`
  - 默认不预选任何项
  - 若提交时仍为空，提示错误并退出
- 当用户未传 `--mode` 时:
  - 不弹出交互
  - 使用默认值 `link`
- 当参数显式传入时，优先使用显式值

### 5) 交互实现方案

- 使用成熟交互库实现，不重复造轮子(建议 `@inquirer/prompts`)
- 新增 `src/prompts.ts` 封装交互逻辑，避免污染 `src/index.ts`

## 兼容性与稳定性

- 继续保留 `link/copy` 双模式
- 继续保留 Windows 下 `link` 权限失败自动降级 `copy`
- 继续保留目标存在时先备份的策略
- 继续支持显式参数模式，兼容脚本调用

## 非目标

- 本版本不修改 `sync` 命令结构
- 本版本不引入交互式“确认写入”二次确认流程

## 确认结果

- `--agents` 默认值: 空（不预选）
- `--agents` 缺省时:
  - TTY 场景进入多选，默认全不选
  - 若最终未选择任何项，报错退出
  - 非 TTY 场景无法交互，直接报错并要求显式传 `--agents`
- `--mode` 缺省时:
  - 直接使用 `link`，不进入交互
