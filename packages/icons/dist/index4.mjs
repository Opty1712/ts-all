import { __module as jsxRuntime } from "./index7.mjs";
import { __require as requireReactJsxRuntime_production_min } from "./index8.mjs";
import { __require as requireReactJsxRuntime_development } from "./index9.mjs";
if (process.env.NODE_ENV === "production") {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}
var jsxRuntimeExports = jsxRuntime.exports;
export {
  jsxRuntimeExports as j
};
