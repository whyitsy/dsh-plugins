// Client bundle: registers the system-prompt editor as a conversation view tab
// (a sibling of 对话 / 轨迹), calling the host `@Remote` service.
window.__ModuleLoader__.load({
  id: "@kakoyo/dsh-system-prompt",
  factory: function (require) {
    var react = require("react");

    if (typeof document !== "undefined") {
      var tag = document.createElement("style");
      tag.dataset.plugin = "@kakoyo/dsh-system-prompt";
      tag.dataset.pluginCss = "@kakoyo/dsh-system-prompt/view.css";
      tag.textContent =
        ".kakoyo-prompt-view{flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;padding:20px}" +
        ".kakoyo-prompt-head{display:flex;flex-direction:column;gap:4px}" +
        ".kakoyo-prompt-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary)}" +
        ".kakoyo-prompt-subtitle{font-size:12px;color:var(--dsw-alias-label-secondary)}" +
        ".kakoyo-prompt-textarea{flex:1;min-height:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:12px;resize:none}" +
        ".kakoyo-prompt-msg{font-size:12px;color:var(--dsw-alias-label-secondary);min-height:16px}" +
        ".kakoyo-prompt-actions{display:flex;justify-content:flex-end;gap:8px}" +
        ".kakoyo-prompt-btn{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer}" +
        ".kakoyo-prompt-btn:disabled{opacity:0.5;cursor:not-allowed}" +
        ".kakoyo-prompt-save{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}";
      document.head.appendChild(tag);
    }

    var inject = ["slots", "remote", "remote.kakoyoSystemPrompt"];

    function apply(ctx) {
      var remote = ctx.remote.kakoyoSystemPrompt;

      function PromptView(props) {
        var sessionId = props.sessionId;
        var textState = react.useState("");
        var text = textState[0];
        var setText = textState[1];
        var statusState = react.useState("loading");
        var status = statusState[0];
        var setStatus = statusState[1];
        var msgState = react.useState("");
        var message = msgState[0];
        var setMessage = msgState[1];

        react.useEffect(function () {
          var alive = true;
          remote.get(sessionId).then(function (res) {
            if (!alive) return;
            if (res && res.ok) { setText(res.text); setStatus("ready"); }
            else { setStatus("error"); setMessage((res && res.error) || "加载失败"); }
          }).catch(function (e) {
            if (!alive) return;
            setStatus("error"); setMessage(String((e && e.message) || e));
          });
          return function () { alive = false; };
        }, [sessionId]);

        function save() {
          setStatus("saving");
          setMessage("");
          remote.set(sessionId, text).then(function (res) {
            if (res && res.ok) { setStatus("ready"); setMessage("已保存，当前会话后续步骤生效"); }
            else { setStatus("error"); setMessage((res && res.error) || "保存失败"); }
          }).catch(function (e) {
            setStatus("error"); setMessage(String((e && e.message) || e));
          });
        }

        function reset() {
          setStatus("saving");
          setMessage("");
          remote.clear(sessionId).then(function (res) {
            if (!res || !res.ok) throw new Error((res && res.error) || "恢复失败");
            return remote.get(sessionId);
          }).then(function (res) {
            if (res && res.ok) { setText(res.text); setStatus("ready"); setMessage("已恢复默认"); }
            else { setStatus("error"); setMessage((res && res.error) || "恢复失败"); }
          }).catch(function (e) {
            setStatus("error"); setMessage(String((e && e.message) || e));
          });
        }

        var busy = status === "loading" || status === "saving";

        return react.createElement(
          "div",
          { className: "kakoyo-prompt-view" },
          react.createElement(
            "div",
            { className: "kakoyo-prompt-head" },
            react.createElement("span", { className: "kakoyo-prompt-title" }, "SystemPrompt · 系统提示词"),
            react.createElement("span", { className: "kakoyo-prompt-subtitle" }, "编辑下方内容并保存，覆盖仅对当前会话后续步骤生效（内存级，不写文件）。")
          ),
          react.createElement("textarea", {
            className: "kakoyo-prompt-textarea",
            value: text,
            disabled: busy,
            onChange: function (e) { setText(e.target.value); }
          }),
          react.createElement("div", { className: "kakoyo-prompt-msg" }, message),
          react.createElement(
            "div",
            { className: "kakoyo-prompt-actions" },
            react.createElement("button", { type: "button", className: "kakoyo-prompt-btn", disabled: busy, onClick: reset }, "恢复默认"),
            react.createElement("button", { type: "button", className: "kakoyo-prompt-btn kakoyo-prompt-save", disabled: busy, onClick: save }, "保存（会话内覆盖）")
          )
        );
      }

      ctx.slots.inject("conversation.view", function () {
        return ctx.slots.register(
          { name: "conversation.view", id: "system-prompt", order: 20, label: "系统提示词" },
          function (props) { return react.createElement(PromptView, props); }
        );
      });
    }

    return { name: "@kakoyo/dsh-system-prompt", inject: inject, apply: apply };
  }
});
