// Host half: a Typert `@Remote` service exposing the system prompt for one
// session, plus an in-memory (session-local) override.
//
// `get`/`set`/`clear` are marked `@Remote`, so the DSH typert build reflects
// them into the API gateway and generates the client `remote.kakoyoSystemPrompt`
// binding. The `__esDecorate`/`__runInitializers` helpers are normally emitted
// by the TypeScript build; they are inlined here so this plain-JS module is
// directly usable.
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

var __runInitializers = function (thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

var __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind;
  var key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? (contextIn["static"] ? ctor : ctor.prototype) : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function (f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = decorators[i](kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

// ---- system prompt rendering (mirrors @deepseek-ai/dsh-system-prompt) ----
var VARIABLE_NAME = /^[a-z][a-z0-9_]*$/;
var GROUP_AT = /^\{\{([^{}]*)\}\}/;

function interpolate(text, variables, name) {
  var result = "";
  var last = 0;
  for (var open = text.indexOf("{{"); open >= 0; open = text.indexOf("{{", last)) {
    var group = GROUP_AT.exec(text.slice(open));
    if (group === null) {
      if (text.indexOf("}}", open + 2) >= 0) throw new Error('malformed prompt variable reference in section "' + name + '"');
      result += text.slice(last, open + 2);
      last = open + 2;
      continue;
    }
    var key = group[0].slice(2, -2);
    if (!VARIABLE_NAME.test(key)) throw new Error('malformed prompt variable reference "{{' + key + '}}" in section "' + name + '"');
    if (!Object.prototype.hasOwnProperty.call(variables, key)) throw new Error('unknown prompt variable "{{' + key + '}}" in section "' + name + '"');
    var value = variables[key];
    if (value === void 0) throw new Error('prompt variable "{{' + key + '}}" has no value in section "' + name + '"');
    result += text.slice(last, open) + value;
    last = open + group[0].length;
  }
  return result + text.slice(last);
}

function renderPrompt(assembly) {
  var variables = assembly.variables || {};
  var sections = assembly.sections || [];
  var out = [];
  for (var i = 0; i < sections.length; i++) {
    var text = interpolate(sections[i].text, variables, sections[i].name);
    if (text.length > 0) out.push(text);
  }
  return out.join("\n\n");
}

var KakoyoSystemPromptService = (function () {
  var _classSuper = TypertRemoteService;
  var _instanceExtraInitializers = [];
  var _get_decorators, _set_decorators, _clear_decorators;

  return class KakoyoSystemPromptService extends _classSuper {
    static {
      var _metadata = typeof Symbol === "function" && Symbol.metadata
        ? Object.create(_classSuper[Symbol.metadata] ?? null)
        : void 0;
      _get_decorators = [Remote("get")];
      _set_decorators = [Remote("set")];
      _clear_decorators = [Remote("clear")];

      __esDecorate(this, null, _get_decorators, {
        kind: "method",
        name: "get",
        static: false,
        private: false,
        access: { has: (obj) => "get" in obj, get: (obj) => obj.get },
        metadata: _metadata
      }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _set_decorators, {
        kind: "method",
        name: "set",
        static: false,
        private: false,
        access: { has: (obj) => "set" in obj, get: (obj) => obj.set },
        metadata: _metadata
      }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _clear_decorators, {
        kind: "method",
        name: "clear",
        static: false,
        private: false,
        access: { has: (obj) => "clear" in obj, get: (obj) => obj.clear },
        metadata: _metadata
      }, null, _instanceExtraInitializers);

      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata
      });
    }

    static inject = ["agents"];

    constructor(ctx, config = {}) {
      super(ctx, "kakoyoSystemPrompt");
      this.overrides = new Map();
      var self = this;
      ctx.effect(function () {
        return function () {
          self.overrides.forEach(function (disposer) {
            try { disposer(); } catch (_e) {}
          });
          self.overrides.clear();
        };
      });
    }

    // Remote: read the current assembled system prompt for one agent.
    async get(agent) {
      var systemPrompt = this.ctx.get("systemPrompt");
      if (systemPrompt === void 0) return { ok: false, error: "systemPrompt unavailable" };
      try {
        var assembly = await systemPrompt.assemble({ agent: agent, scope: agent });
        return { ok: true, text: renderPrompt(assembly) };
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) };
      }
    }

    // Remote: replace the system prompt for one agent's subsequent steps.
    set(agent, text) {
      if (typeof text !== "string") return { ok: false, error: "missing text" };
      var scoped = agent.ctx.get("systemPrompt");
      if (scoped === void 0 || typeof scoped.section !== "function") {
        return { ok: false, error: "systemPrompt unavailable for this agent" };
      }
      var prev = this.overrides.get(agent.id);
      if (prev) {
        try { prev(); } catch (_e) {}
        this.overrides.delete(agent.id);
      }
      var disposer = scoped.section({
        name: "session:system-prompt-override",
        order: 0,
        text: text,
        complete: true
      });
      this.overrides.set(agent.id, disposer);
      return { ok: true };
    }

    // Remote: remove the override, restoring the composed system prompt.
    clear(agent) {
      var prev = this.overrides.get(agent.id);
      if (prev) {
        try { prev(); } catch (_e) {}
        this.overrides.delete(agent.id);
      }
      return { ok: true };
    }
  };
})();

export { KakoyoSystemPromptService, KakoyoSystemPromptService as default };
