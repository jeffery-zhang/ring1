# @jingoz/ring1

`ring1` is a TypeScript CLI for syncing markdown guidance files to agent user-scope locations.

## Install

```bash
npm install
npm run build
npm link
```

## Usage

```bash
ring1 sync <targetFile> [--agents <agent...>] [--mode link|copy]
```

### Arguments

- `<targetFile>`: markdown file to sync (`.md`)
- `--agents`: target agents, supports `claude`, `codex`, `opencode`
  - when provided, values are used directly (space/comma separated)
  - when omitted:
    - in TTY, an interactive multi-select prompt is shown
    - nothing is preselected by default; empty submit returns an error
    - in non-TTY, the command errors and requires explicit `--agents`
- `--mode`: sync mode, defaults to `link`
  - `link`: create symbolic links
  - `copy`: copy files directly

### Target Paths

- `codex` -> `~/.codex/AGENTS.md`
- `claude` -> `~/.claude/CLAUDE.md`
- `opencode` -> `~/.config/opencode/AGENTS.md`

Windows equivalents:

- `%USERPROFILE%\\.codex\\AGENTS.md`
- `%USERPROFILE%\\.claude\\CLAUDE.md`
- `%USERPROFILE%\\.config\\opencode\\AGENTS.md`

### Backup Rule

If a destination file already exists, it is renamed first:

- `AGENTS.bak.<timestamp>.md`
- `CLAUDE.bak.<timestamp>.md`
- `AGENTS.bak.<timestamp>.md` (opencode)

### Windows Fallback

- When `--mode link` fails due to permission limits on Windows, it automatically falls back to `copy`
- The sync output will include a fallback message

### Examples

```bash
ring1 sync ./my-guide.md --agents codex claude
ring1 sync ./my-guide.md --agents opencode --mode copy
ring1 sync ./my-guide.md
```
