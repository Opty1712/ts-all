import {useEffect, useState} from 'react';

import {
  CssVariableName,
  cssVariablesByTheme,
  Theme,
} from '../styles/generated/CSSVariablesByTheme';

/**
 * Хук для получения значения CSS-переменной из сгенерированной карты токенов.
 * Тема определяется по классу на `html`: если класса нет, используется `light`.
 *
 * **Пример использования:**
 * ```
 * const accentColor = useCssVariable('--b2bColorsTextAccent'); // accentColor → "#0077ff"
 * ```
 * */
export const useCssVariable = (variableName: CssVariableName) => {
  const [theme, setTheme] = useState<Theme>(getThemeFromHtmlClassName);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getThemeFromHtmlClassName());
    };

    updateTheme();

    /** для отслеживания изменения темы */
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateTheme();
        }
      });
    });

    if (document.documentElement) {
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  return cssVariablesByTheme[theme][variableName];
};

const getThemeFromHtmlClassName = (): Theme => {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }

  const {classList} = document.documentElement;

  if (classList.length === 0) {
    return DEFAULT_THEME;
  }

  return Array.from(classList).find(checkIsTheme) ?? DEFAULT_THEME;
};

const checkIsTheme = (className: string): className is Theme =>
  Object.prototype.hasOwnProperty.call(cssVariablesByTheme, className);

const DEFAULT_THEME: Theme = 'light';
