# 开发规范 · `@kakoyo/dsh-*` 插件

本文档是 `@kakoyo/dsh-plugins` 仓库的开发标准，供后续开发者和 Agent 遵循。**目标：严格遵循 DeepSeek Harness（DSH）官方约定**，保证插件能被 `dsh plugin add`、宿主组合（cordis.yml）、agent preset 以及 web 客户端扫描正确装载。

---

## 1. 原则

1. **一套代码，每个包独立安装**：每个包都是 profile bundle、自带 `cordis.patch.yml`，按需单独 `dsh plugin add`；**不再维护「一条命令装全部」的捆绑包**，避免版本号出现在多个位置。
2. **严格遵循 DSH 官方结构**：`package.json` 的 `dsh.client` / `dsh.bundle.patch` 清单、`lib/index.js`（宿主）/ `lib/client.js`（客户端 `__ModuleLoader__` bundle）、`cordis.patch.yml`、Typert `@Remote` 服务，全部按 DSH 包（`@deepseek-ai/dsh-*`）的写法来。
3. **命名**：所有包统一 `@kakoyo/dsh-*` 前缀；每个包 `keywords` 含 `dsh-plugin`。

## 2. 三种包形态

| 形态 | 例子 | `dsh` 清单 | 说明 |
| --- | --- | --- | --- |
| 纯客户端插件 | `@kakoyo/dsh-clock` | `dsh.client` | 只在浏览器渲染，宿主端是空插件。 |
| 宿主 + 客户端 | `@kakoyo/dsh-system-prompt` | `dsh.client` + 宿主服务 | 宿主提供 `@Remote` 服务，客户端视图调用它。 |
| bundle（组合层） | 每个包都是 | `dsh.bundle.patch` | 每个包自带 `cordis.patch.yml`，`dsh plugin add` 后自动接入组合。 |

三者都定义在 `package.json` 的 `dsh` 字段里，可同时存在（例如 `@kakoyo/dsh-clock` 同时是 bundle 和 client 插件）。

## 3. 目录规范

```
packages/<name>/
  package.json          # name/version/exports/files/dsh 清单/dependencies
  cordis.patch.yml      # 该包作为 bundle 时的组合补丁
  lib/
    index.js            # 宿主端（main）：{ name, inject, apply } 或 Service 类
    client.js           # 客户端：window.__ModuleLoader__.load({ id, factory })
```

- `exports` 必须暴露 `.`、`./client`、`./cordis.patch.yml`、`./package.json`。
- `files` 必须包含 `lib` 和 `cordis.patch.yml`（否则发布后缺失）。
- 每个包的 `cordis.patch.yml` 里那一行的 `id` 必须是**全局稳定 id**（见 §7）。

## 4. 客户端 bundle（`dsh.client`）

`dsh.client` 清单：

```json
"dsh": { "client": { "inject": [], "platform": "web" } }
```

- `inject`：该 bundle 会 `require()` 的**客户端包名**（DSH 包，不含 `react`——`react`/`react/jsx-runtime` 是内核静态注册的表词）。纯 `ctx.get('slots')` 这种运行时服务不需要列入。
- `platform`：`web`。

客户端 bundle 必须写成 `window.__ModuleLoader__.load({ id, factory })` 工厂形式，`factory(require)` 返回 `{ name, inject, apply }`：

```js
window.__ModuleLoader__.load({
  id: "@kakoyo/dsh-clock",
  factory(require) {
    const react = require("react");
    // CSS 在 factory 里注入（document.head），带 data-plugin / data-plugin-css 标记
    const inject = ["slots", "timer"];
    function apply(ctx) { /* ctx.slots.inject / ctx.slots.register ... */ }
    return { name: "@kakoyo/dsh-clock", inject, apply };
  },
});
```

宿主端 `clientModules` 服务会扫描已启用的 Loader 条目，解析 `exports["./client"]`，把它哈希后以 `/plugins/<name>/client.js` 提供——所以 `lib/client.js` 就是这个可直接被提供的 bundle。

## 5. 宿主 `@Remote` 服务（Typert）

需要「浏览器 ↔ 宿主」通信时，用 DSH 的 Typert 协议。标准写法（对照上游 `@deepseek-ai/dsh-goal`）：

```js
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

export class KakoyoSystemPromptService extends TypertRemoteService {
  static inject = ["agents"];

  constructor(ctx, config = {}) {
    super(ctx, "kakoyoSystemPrompt"); // key 决定客户端 remote.<key>
  }

  // @Remote("get")  —— 见下方装饰器注册
  async get(agent) { /* ... */ }
  // @Remote("set")
  set(agent, text) { /* ... */ }
  // @Remote("clear")
  clear(agent) { /* ... */ }
}
```

要点：

- `@Remote` 标记的公开实例方法，首参是 `agent`（由网关从线身份解析的活 agent；客户端侧传入的是 `sessionId`）。
- `super(ctx, serviceKey)` 的 `serviceKey` 决定客户端绑定名 `remote.<serviceKey>`。
- 返回值必须是 JSON 可序列化（业务值直接 return；出错直接 throw，网关会转成 `{ ok: false, error }`）。
- 装饰器 helper（`__esDecorate`/`__runInitializers`）必须**在构造函数里运行 `__runInitializers(this, ...)`**，否则 `Remote` 标记不会注册到原型上，网关发现不了方法。

**宿主端（无需构建）**：`dsh-api-gateway` 通过 `typertRemote` 绑定 + `remoteMethods()` 做 SRC 发现，运行时推导 `src-json` 描述符路由到服务——所以手写的 `@Remote` 服务开箱即用。

**客户端（两条路）**：`remote.<serviceKey>` 绑定是「生成产物」。要么用 DSH 的 `tsdown`+typert 构建产出 `./remote` 工件；要么在客户端 `apply` 里手动 `ctx.remote.$mount(contribution)` 挂载。注意：客户端的 `$mount` 要求 **`mode: "strict"` 的 codec**（必须带 `schema.parse`，`src-json` 会被拒绝），所以手写时用「透传 schema」即可（`{ parse: v => v }`）。本仓库 `@kakoyo/dsh-system-prompt` 即采用手动 `$mount` 方案，见 `packages/system-prompt/lib/client.js`。

> **关键坑（务必照做）**：`ctx.remote.<serviceKey>` 是一个**命名空间服务**，直接访问要求 `inject: ["remote.<serviceKey>"]`；但注入它会**死锁**——该服务只在 `$mount` 里才被提供，而 `$mount` 又在本插件的 `apply` 里运行，于是插件永远 `pending`。正确写法是**不注入命名空间**，`$mount` 之后用 `ctx.get("remote.<serviceKey>")`（Cordis 的「免注入读取」API）拿到该命名空间服务。宿主侧参数用方法形参名匹配 lookup（如首参叫 `agent` 会命中 `dsh-agent` 注册的 `agent` lookup，wire 为 `agentId`）；客户端描述符的 `wire` 需与宿主 lookup 的 `wire` 一致。

## 6. 单独安装（bundle 设计）

每个包都是 bundle，`cordis.patch.yml` 里各插自己那一行，互不依赖、互不捆绑：

| 包 | `cordis.patch.yml` 内容 | `dependencies` |
| --- | --- | --- |
| `@kakoyo/dsh-clock` | `- insert: [{ id: kakoyo-clock, name: '@kakoyo/dsh-clock' }]` | — |
| `@kakoyo/dsh-system-prompt` | `- insert: [{ id: kakoyo-system-prompt, name: '@kakoyo/dsh-system-prompt' }]` | — |

因此：

```sh
dsh plugin --profile web add @kakoyo/dsh-clock          # 只装时钟
dsh plugin --profile web add @kakoyo/dsh-system-prompt  # 只装系统提示词
```

`dsh plugin` 是 pnpm 转发器：`add` 后会把声明了 `dsh.bundle.patch` 的依赖加入 `dsh.profile.bundles`，其 patch 作为组合层生效（先于 profile 自己的 `cordis.patch.yml` 与 `--patch`）。

> **为什么取消「全家桶」捆绑包**：早期全家桶的 `dependencies` 里的版本区间与 `cordis.patch.yml` 里的行需要两处维护，且 lockfile 会把它锁到旧版本。改为「每包独立」后版本号只存在于各包自己的 `package.json` 一处。
>
> 若日后需要「一条命令装全部」，可参照上游 dsh-web-ui 的**聚合包**方案：用 `aggregate.yml` 清单 + `scripts/aggregate.mjs` 自动生成聚合包的 `cordis.patch.yml` 与 `dependencies`（`workspace:*`，发布时 pnpm 自动改写为具体版本），从而仍然只有一处版本来源。参见 https://github.com/zhu1090093659/dsh-web-ui 的 `packages/dsh-web-ui-all` 与 `scripts/aggregate.mjs`。

## 7. 构建工具链（严格路径）

上游 DSH 用 TypeScript + `tsdown`（+ DSH bundle/typert 插件）构建：

- `src/` 源码 → `lib/index.js`、`lib/client.js`（`__ModuleLoader__` 包裹 + CSS 内联）、`lib/types/*.d.ts`、`lib/invariant.js`。
- `@Remote` 服务额外产出 `./typert` 工件（严格 schema + 客户端 `remote.*` 绑定）。

迁移到严格路径需要：`tsconfig.json`、`tsdown` 配置、DSH 的 bundle 插件与 typert 配置（这些构建插件随 DSH 源码仓库分发，未随 npm 包发布）。当前仓库的手写 `lib/` 是构建产物的等价物，功能一致，缺的是严格类型/强 codec。

## 8. 发布流程

```sh
# —— npm ——
npm login                                          # 一次性，输入 npm 凭据

# 各包独立，无依赖顺序要求；改哪个就发哪个
npm publish --workspace packages/clock --access public
npm publish --workspace packages/system-prompt --access public

# —— GitHub ——
git remote add origin git@github.com:<you>/dsh-plugins.git
git push -u origin main
gh repo edit --add-topic dsh-plugin                # 或 GitHub 网页 Settings → Topics
```

包之间没有依赖关系，发布顺序任意。升级时只改该包 `version` 再发布它即可；用户侧用 `dsh plugin --profile web update <pkg>`（或 remove 后再 add）拉取新版本。

## 9. 新插件 checklist

- [ ] 包名 `@kakoyo/dsh-<name>`，`keywords` 含 `dsh-plugin`。
- [ ] 客户端逻辑写成 `__ModuleLoader__` bundle，`dsh.client.inject` 只列真实 `require()` 的 DSH 包。
- [ ] 宿主逻辑（如有）写成 `{ name, inject, apply }` 或 Typert `@Remote` 服务。
- [ ] 每个包带 `cordis.patch.yml`（稳定行 `id`）并声明 `dsh.bundle.patch`。
- [ ] 更新根 README 的包表；新插件只需带自己的 `cordis.patch.yml`（禁止跨包捆绑依赖）。
- [ ] `node --check` 通过、`package.json` JSON 校验通过、`git` 提交。
