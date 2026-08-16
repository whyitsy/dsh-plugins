# @kakoyo/dsh-plugins

Kakoyo's plugin collection for the [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness), published under the `@kakoyo` npm scope.

[中文](README.md) · [Development guide](DEVELOPMENT.md)

> This repository is tagged with the `dsh-plugin` topic.

## Plugins

| Plugin | What it does |
| --- | --- |
| `@kakoyo/dsh-clock` | Shows the current **date + time (to the second)** at the right end of the composer tool row, refreshing every second. |
| `@kakoyo/dsh-system-prompt` | Adds a **系统提示词 (System Prompt)** tab beside 对话 / 轨迹 to view and **session-locally override** the current session's system prompt. |
| `@kakoyo/dsh-kakoyo` | Shows the Kakoyo plugin management card in **Settings → Plugins → Plugin config list** (standalone; bundles nothing). |

## Install

Every plugin is a **standalone package** with no interdependencies — install only what you want:

```sh
# Clock
dsh plugin --profile web add @kakoyo/dsh-clock

# System-prompt editor
dsh plugin --profile web add @kakoyo/dsh-system-prompt

# Management card (optional; just lists the plugins)
dsh plugin --profile web add @kakoyo/dsh-kakoyo
```

Skipping `@kakoyo/dsh-kakoyo` does not affect the other two. Restart to take effect:

```sh
dsh web
```

> There is no more "install everything" bundle: since 0.2.0, `@kakoyo/dsh-kakoyo` is a standalone management card that neither depends on nor bundles the others, so versions are never maintained in more than one place.

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
