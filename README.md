# @kakoyo/dsh-plugins

Kakoyo's DeepSeek Harness (DSH) plugins, published under the `@kakoyo` npm scope.

> **Topic**: this repository is tagged with the `dsh-plugin` topic on GitHub.

## Packages

| Package | Type | What it does |
| --- | --- | --- |
| [`@kakoyo/dsh-clock`](packages/clock) | client-only | Current date + time (to the second) in the composer tool row (`conversation.input.right`). |
| [`@kakoyo/dsh-system-prompt`](packages/system-prompt) | host + client | View and edit the current session's assembled system prompt, as a `对话`/`轨迹`-style view tab. Saving applies an in-memory, session-local override (no file writes). |
| [`@kakoyo/dsh-kakoyo`](packages/kakoyo) | client-only | A unified management card in **Settings → Plugins → Plugin config list** for the `@kakoyo` plugin family. |

## How DSH plugins are packaged

A DSH npm package is a normal npm package plus two conventions:

- **Host half** (`lib/index.js`): a Cordis plugin (`{ name, inject, apply }` or a `Service` class). Composed by a row in your host composition or agent preset `cordis.yml`.
- **Client half** (`lib/client.js`): a `window.__ModuleLoader__.load({ id, factory })` bundle. Declared via the `dsh.client` field in `package.json`; the DSH web shell scans enabled Loader entries, resolves `exports["./client"]`, and serves it as `/plugins/<name>/client.js`.

The packages in this repo ship hand-written `lib/` modules, so they work directly without a build step. To adopt the full TypeScript + `tsdown` pipeline (source maps, `.d.ts`, generated `@Remote` bindings), see "Build toolchain" below.

## Install & compose

### Via `dsh plugin add` (recommended)

`@kakoyo/dsh-kakoyo` is a **profile bundle** (it declares `dsh.bundle.patch`), so one command installs it and its two dependencies, and wires them into the profile composition:

```sh
dsh plugin --profile web add @kakoyo/dsh-kakoyo
```

That `pnpm add`s `@kakoyo/dsh-kakoyo` (pulling in `@kakoyo/dsh-clock` + `@kakoyo/dsh-system-prompt` as dependencies), then reconciles it into `dsh.profile.bundles` so its [`cordis.patch.yml`](packages/kakoyo/cordis.patch.yml) is applied as a composition layer. Restart `dsh --profile web` to pick it up.

> The packages must be published to npm first (`npm publish --workspaces`), so pnpm can resolve them.

### Manually (host composition / agent preset)

1. `npm install @kakoyo/dsh-clock @kakoyo/dsh-system-prompt @kakoyo/dsh-kakoyo`
2. Add the three rows shown in [`cordis.example.yml`](cordis.example.yml) to your composition.

## Build toolchain & the `@Remote` note

The shipped DSH packages are built with `tsdown` plus the DSH typert/bundle plugins, which produce the `__ModuleLoader__` client wrapper and, for `@Remote` services, generated schemas + the client `remote.*` binding.

- **`@kakoyo/dsh-clock` and `@kakoyo/dsh-kakoyo` are client-only** — their bundles are already in the `__ModuleLoader__` format and need no build step; they work as-is.
- **`@kakoyo/dsh-system-prompt`** needs one client→host RPC (read/override the system prompt). Its host half is a standard Typert `@Remote` service (`get`/`set`/`clear`, mirroring upstream `@deepseek-ai/dsh-goal`). The host methods are reflected at runtime by the DSH typert loader/gateway (`remoteMethods()` → the `src-json` SRC path), so the simple signatures here do not strictly require the build; the strict schema/`.d.ts` path does. If you adopt the DSH `tsdown`+typert pipeline, point it at `packages/system-prompt/lib/index.js` (or migrate it to `src/` TypeScript following the goal-service pattern) to get the fully-generated `remote.kakoyoSystemPrompt` binding.

## Publish

### npm

```sh
npm login            # once, with your npm credentials
npm publish --workspaces --access public
```

Each package's `package.json` has `publishConfig.access: "public"` and `keywords: ["dsh-plugin", ...]`.

### GitHub

```sh
git remote add origin git@github.com:<you>/dsh-plugins.git
git push -u origin main
```

Then add the topic on the GitHub repo page: **Settings → Topics → `dsh-plugin`** (or `gh repo edit --add-topic dsh-plugin` after `gh auth login`).

## License

MIT
