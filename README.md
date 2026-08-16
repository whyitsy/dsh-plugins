# @kakoyo/dsh-plugins

Kakoyo 的 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 插件合集，统一以 `@kakoyo` 为 npm 作用域。

[English](README.en.md) · [开发规范](DEVELOPMENT.md)

> 本仓库已打上 `dsh-plugin` 主题。

## 插件

| 插件 | 功能 |
| --- | --- |
| `@kakoyo/dsh-clock` | 在聊天框（输入框）工具行右端显示当前**日期 + 时间（精确到秒）**，每秒刷新。 |
| `@kakoyo/dsh-system-prompt` | 在「对话 / 轨迹」标签旁新增「系统提示词」标签，查看并**会话内覆盖**当前会话的系统提示词。 |

## 安装

每个插件都是**独立包**，互不依赖，按需单独安装：

```sh
# 时钟
dsh plugin --profile web add @kakoyo/dsh-clock

# 系统提示词编辑器
dsh plugin --profile web add @kakoyo/dsh-system-prompt
```

想要哪个就装哪个，两者互不依赖。重启后生效：

```sh
dsh web
```

## 使用

- **时钟**：装好后，聊天输入框工具行右端即显示当前日期时间，无需其他操作。
- **系统提示词**：点击顶部「系统提示词」标签进入编辑器；修改后点「保存（会话内覆盖）」，仅对当前会话后续步骤生效（内存级，不写文件）；「恢复默认」撤销覆盖。

## 截图

> 截图待补充：请将图片放入 `docs/screenshots/` 目录，并保持文件名一致。

| 功能 | 截图 |
| --- | --- |
| 时钟（聊天框工具行右端） | ![时钟](docs/screenshots/clock.png) |
| 系统提示词（标签页编辑器） | ![系统提示词](docs/screenshots/system-prompt.png) |

## 手动安装（可选）

不想用 `dsh plugin add` 时，也可以直接 `npm install`，再在宿主组合或 agent preset 里手动加行：

```sh
npm install @kakoyo/dsh-clock @kakoyo/dsh-system-prompt
```

```yaml
- id: kakoyo-clock
  name: '@kakoyo/dsh-clock'

- id: kakoyo-system-prompt
  name: '@kakoyo/dsh-system-prompt'
```

## 环境要求

- 已安装 DeepSeek Harness（`dsh` 命令可用）。
- 使用 `dsh plugin add` 时需要 `pnpm`。

## 许可

[MIT](LICENSE)

## 开发者

插件结构、构建、发布规范见 [DEVELOPMENT.md](DEVELOPMENT.md)。
