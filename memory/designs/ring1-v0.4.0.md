# ring1 v0.4.0 设计方案

## 本版本定位

- 本版本基于 `v0.3.0` 的规划继续演进
- 新增交互式选择能力，减少命令参数输入成本
- 同步固化已确认策略: 默认 agents 扩展为 `claude,codex,opencode`

## 相对 v0.3.0 的新增与改造

### 1) 默认 agents 策略固化

- 当非交互场景或显式不走交互时，默认 agents 为:
  - `claude`
  - `codex`
  - `opencode`

### 2) `--agents` 缺省时启用多选交互

- 当用户未传 `--agents` 时，CLI 弹出多选列表
- 交互方式:
  - 方向键移动
  - 空格选择/取消
  - 回车提交
- 可选项: `claude`、`codex`、`opencode`
- 至少选中 1 项，否则提示并阻止提交

### 3) `--mode` 缺省时启用单选交互

- 当用户未传 `--mode` 时，CLI 弹出单选列表
- 可选项:
  - `link`
  - `copy`
- 交互方式: 方向键选择，回车确认

### 4) 交互实现方案

- 采用成熟交互库，不重复造轮子（建议: `@inquirer/prompts`）
- 新增独立交互模块(建议): `src/prompts.ts`
- `src/index.ts` 仅负责命令编排，具体交互细节下沉到 `prompts` 模块

## 执行流程调整

1. 解析 CLI 参数
2. 解析/确认 agents:
   - 传入 `--agents` -> 走原校验逻辑
   - 未传 `--agents` -> 弹出多选交互
3. 解析/确认 mode:
   - 传入 `--mode` -> 走原校验逻辑
   - 未传 `--mode` -> 弹出单选交互
4. 进入现有同步流程(校验、备份、link/copy、Windows 降级、结果汇总)

## 兼容性设计

- 继续支持显式参数模式（脚本自动化场景）
- 继续保留 Windows 下 `link` 失败自动降级 `copy`
- `opencode` 目标路径保持:
  - Unix-like: `~/.config/opencode/AGENTS.md`
  - Windows: `%USERPROFILE%\\.config\\opencode\\AGENTS.md`

## 非目标

- 本版本不调整 `sync` 命令名称与基本结构
- 本版本不引入交互式“二次确认写入”流程

## 待确认事项(开发前确认)

- 非 TTY 环境（如 CI）且缺少 `--agents` / `--mode` 时:
  - 方案 A: 回退默认值继续执行
  - 方案 B: 直接报错并要求显式传参
