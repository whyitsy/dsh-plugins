// Client bundle (hand-written in the __ModuleLoader__ factory format the DSH
// web shell loads). The host `dsh.client` scan serves this file verbatim as
// `/plugins/@kakoyo/dsh-clock/client.js`.
window.__ModuleLoader__.load({
  id: "@kakoyo/dsh-clock",
  factory: function (require) {
    var react = require("react");

    if (typeof document !== "undefined") {
      var tag = document.createElement("style");
      tag.dataset.plugin = "@kakoyo/dsh-clock";
      tag.dataset.pluginCss = "@kakoyo/dsh-clock/clock.css";
      tag.textContent =
        ".kakoyo-clock{font-variant-numeric:tabular-nums;font-size:12px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;user-select:none}";
      document.head.appendChild(tag);
    }

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function format(d) {
      return (
        d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
        " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
      );
    }

    var inject = ["slots", "timer"];

    function apply(ctx) {
      function Clock() {
        var state = react.useState(function () { return new Date(); });
        var now = state[0];
        var setNow = state[1];
        react.useEffect(function () {
          return ctx.interval(function () { setNow(new Date()); }, 1000);
        }, []);
        return react.createElement("span", { className: "kakoyo-clock" }, format(now));
      }

      ctx.slots.inject("conversation.input.right", function () {
        return ctx.slots.register(
          { name: "conversation.input.right", id: "kakoyo-clock" },
          function () { return react.createElement(Clock); }
        );
      });
    }

    return { name: "@kakoyo/dsh-clock", inject: inject, apply: apply };
  }
});
