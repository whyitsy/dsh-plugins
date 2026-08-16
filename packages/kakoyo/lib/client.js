// Client bundle: a unified management card in Settings -> Plugins -> Plugin
// config list, listing the @kakoyo plugin family.
window.__ModuleLoader__.load({
  id: "@kakoyo/dsh-kakoyo",
  factory: function (require) {
    var react = require("react");

    if (typeof document !== "undefined") {
      var tag = document.createElement("style");
      tag.dataset.plugin = "@kakoyo/dsh-kakoyo";
      tag.dataset.pluginCss = "@kakoyo/dsh-kakoyo/kakoyo.css";
      tag.textContent =
        ".kakoyo-card{display:flex;flex-direction:column;gap:12px;padding:16px 0}" +
        ".kakoyo-card-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}" +
        ".kakoyo-row{display:flex;flex-direction:column;gap:2px;padding:10px 0}" +
        ".kakoyo-row+.kakoyo-row{border-top:1px solid var(--dsw-alias-border-l2)}" +
        ".kakoyo-name{font-size:13px;color:var(--dsw-alias-label-primary)}" +
        ".kakoyo-meta{font-size:12px;color:var(--dsw-alias-label-tertiary)}" +
        ".kakoyo-cmd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:2px 6px;display:inline-block;margin-top:4px}";
      document.head.appendChild(tag);
    }

    var PLUGINS = [
      {
        name: "@kakoyo/dsh-clock",
        cmd: "dsh plugin --profile web add @kakoyo/dsh-clock",
        desc: "聊天框工具行右端的日期+时间显示（精确到秒）。"
      },
      {
        name: "@kakoyo/dsh-system-prompt",
        cmd: "dsh plugin --profile web add @kakoyo/dsh-system-prompt",
        desc: "系统提示词查看与编辑（会话内覆盖，标签页形式）。"
      },
      {
        name: "@kakoyo/dsh-kakoyo",
        cmd: "dsh plugin --profile web add @kakoyo/dsh-kakoyo",
        desc: "本管理卡片（各插件独立安装，版本以 npm 发布为准）。"
      }
    ];

    function KakoyoCard() {
      return react.createElement(
        "div",
        { className: "kakoyo-card" },
        react.createElement("div", { className: "kakoyo-card-title" }, "Kakoyo 插件"),
        react.createElement(
          "div",
          { className: "kakoyo-meta" },
          "以下插件各自独立安装，互不依赖。"
        ),
        PLUGINS.map(function (p) {
          return react.createElement(
            "div",
            { className: "kakoyo-row", key: p.name },
            react.createElement("div", { className: "kakoyo-name" }, p.name),
            react.createElement("div", { className: "kakoyo-meta" }, p.desc),
            react.createElement("code", { className: "kakoyo-cmd" }, p.cmd)
          );
        })
      );
    }

    var inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("settings.plugin.item", function () {
        return ctx.slots.register(
          { name: "settings.plugin.item", id: "kakoyo", order: 1000 },
          function () { return react.createElement(KakoyoCard); }
        );
      });
    }

    return { name: "@kakoyo/dsh-kakoyo", inject: inject, apply: apply };
  }
});
