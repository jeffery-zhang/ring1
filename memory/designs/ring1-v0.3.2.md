# ring1 v0.3.2 设计方案

## 本版本目标

- 在现有 `claude`、`codex`、`opencode` 的基础上新增 `gemini` 支持
- 保持现有 CLI 行为不变，仅扩展可选 agent 与目标路径映射

## 相对 v0.3.1 的增量改造

### 1) 新增 Gemini Agent 定义

- 新增 Agent 标识: `gemini`
- 目标路径:
  - Unix-like: `~/.gemini/GEMINI.md`
  - Windows: `%USERPROFILE%\\.gemini\\GEMINI.md`
- 在实现中使用路径片段拼接，避免平台分隔符问题

### 2) CLI 可选项扩展

- `--agents` 参数支持值增加 `gemini`
- 交互多选列表同步展示 `gemini`
- 非法 agent 提示中的可选值列表同步包含 `gemini`

### 3) 文档更新

- README 的支持列表、目标路径与示例同步补充 `gemini`

## 保持不变

- `--mode` 缺省仍为 `link`
- `--agents` 缺省时仍走交互多选，默认不预选
- Windows 下 `link` 权限失败仍自动降级 `copy`
