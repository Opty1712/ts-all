import { j as jsxRuntimeExports } from "./index4.mjs";
import { SomeVKProject } from "./index5.mjs";
import styles from "./index6.mjs";
function getKeys(object) {
  return Object.keys(object);
}
const capsAndDigits = /(\d+|[A-Z])/g;
const getIconSet = () => {
  const iconSet = getKeys(SomeVKProject).reduce((accumulator, name) => {
    const a11yName = name.replace(capsAndDigits, " $&");
    accumulator[name] = ({ className = "", ...props }) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "i",
          {
            "aria-hidden": "true",
            ...props,
            className: `${SomeVKProject[name]} ${className}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: styles.srOnly, children: a11yName })
      ] });
    };
    return accumulator;
  }, {});
  return iconSet;
};
const icons = getIconSet();
const { IconAdd12, IconAdd16, IconAdd20, IconAdd24, IconErrorCircleFilled16, IconErrorCircleFilled20, IconErrorCircleFilled24, IconFavorite16, IconFavorite20, IconFavorite24, IconFavoriteFilled16, IconFavoriteFilled20, IconFavoriteFilled24, IconInfo12, IconInfo16, IconInfo20, IconInfo24, IconUser16, IconUser20, IconUser24 } = icons;
export {
  IconAdd12,
  IconAdd16,
  IconAdd20,
  IconAdd24,
  IconErrorCircleFilled16,
  IconErrorCircleFilled20,
  IconErrorCircleFilled24,
  IconFavorite16,
  IconFavorite20,
  IconFavorite24,
  IconFavoriteFilled16,
  IconFavoriteFilled20,
  IconFavoriteFilled24,
  IconInfo12,
  IconInfo16,
  IconInfo20,
  IconInfo24,
  IconUser16,
  IconUser20,
  IconUser24
};
