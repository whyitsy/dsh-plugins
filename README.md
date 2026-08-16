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

1. Install into your DSH deployment:

   ```sh
   npm install @kakoyo/dsh-clock @kakoyo/dsh-system-prompt @kakoyo/dsh-kakoyo
   ```

2. Add rows to your composition (host composition or agent preset). See [`cordis.example.yml`](cordis.example.yml).

   - `@kakoyo/dsh-system-prompt` is a **host** service — its row belongs in the host composition (or a preset, if you want it per-session).
   - `@kakoyo/dsh-clock` and `@kakoyo/dsh-kakoyo` are client-only; they still need a Loader row so the web client scan enables them.

3. Rebuild/restart the web shell so the `dsh.client` scan picks up the new bundles.

## Build toolchain (optional)

The shipped DSH packages are built with `tsdown` plus the DSH typert/bundle plugins, which produce the `__ModuleLoader__` client wrapper and the `remote.*` client bindings for `@Remote` services.

- This repo's client bundles are already in that wrapper format, so they are usable as-is.
- The **only** piece that requires the DSH typert build is `@kakoyo/dsh-system-prompt`'s `remote.kakoyoSystemPrompt` client binding: the host `@Remote` methods (`get`/`set`/`clear`) must be reflected by the typert gateway to generate that client binding and the API routes. When you adopt the DSH build pipeline, point it at `packages/system-prompt/lib/index.js` (or migrate it to `src/` TypeScript following the upstream `@deepseek-ai/dsh-goal` service pattern).

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
