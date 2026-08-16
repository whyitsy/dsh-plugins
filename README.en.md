# @kakoyo/dsh-plugins

Kakoyo's plugin collection for the [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness), published under the `@kakoyo` npm scope.

[中文](README.md) · [Development guide](DEVELOPMENT.md)

> This repository is tagged with the `dsh-plugin` topic.

## Plugins

| Plugin | What it does |
| --- | --- |
| `@kakoyo/dsh-clock` | Shows the current **date + time (to the second)** at the right end of the composer tool row, refreshing every second. |
| `@kakoyo/dsh-system-prompt` | Adds a **系统提示词 (System Prompt)** tab beside 对话 / 轨迹 to view and **session-locally override** the current session's system prompt. |
| `@kakoyo/dsh-kakoyo` | The all-in-one bundle: installs the two above in one command, and shows a management card in **Settings → Plugins → Plugin config list**. |

## Install

### Install everything (recommended)

```sh
dsh plugin --profile web add @kakoyo/dsh-kakoyo
```

This pulls in `@kakoyo/dsh-clock` and `@kakoyo/dsh-system-prompt` too. Restart to take effect:

```sh
dsh web
```

### Install individually

```sh
# Clock only
dsh plugin --profile web add @kakoyo/dsh-clock

# System-prompt editor only
dsh plugin --profile web add @kakoyo/dsh-system-prompt
```

## Usage

- **Clock**: once installed, the date/time appears at the right end of the composer tool row — no further setup.
- **System Prompt**: open the **系统提示词** tab, edit, then click **保存（会话内覆盖）** — the override applies only to subsequent steps of the current session (in-memory, no file writes); **恢复默认** reverts it.
- **Management card**: Settings → Plugins → Plugin config list shows the Kakoyo plugin roster.

## Screenshots

> To be added: drop the images into `docs/screenshots/`, keeping the same file names.

| Feature | Screenshot |
| --- | --- |
| Clock (composer tool row, right end) | ![Clock](docs/screenshots/clock.png) |
| System Prompt (tab editor) | ![System Prompt](docs/screenshots/system-prompt.png) |
| Management card (plugin config list) | ![Management card](docs/screenshots/settings.png) |

## Manual install (optional)

If you prefer not to use `dsh plugin add`, `npm install` the packages and add rows to your host composition or agent preset:

```sh
npm install @kakoyo/dsh-clock @kakoyo/dsh-system-prompt @kakoyo/dsh-kakoyo
```

```yaml
- id: kakoyo-clock
  name: '@kakoyo/dsh-clock'

- id: kakoyo-system-prompt
  name: '@kakoyo/dsh-system-prompt'

- id: kakoyo-settings
  name: '@kakoyo/dsh-kakoyo'
```

## Requirements

- DeepSeek Harness installed (`dsh` on PATH).
- `pnpm` (only needed for `dsh plugin add`).

## License

[MIT](LICENSE)

## Developers

See [DEVELOPMENT.md](DEVELOPMENT.md) for package structure, build, and publishing conventions.
