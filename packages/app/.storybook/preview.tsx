import '@demo/icons/dist/style.css';
import '@demo/ui-kit/lib/style.css';
import type {Preview} from '@storybook/react';
import {configure} from 'mobx';
import {I18nextProvider} from 'react-i18next';

import {APP_CONFIG} from '../src/config/appConfig';
import {i18n} from '../src/i18n';
import {StoresProvider} from '../src/stores/StoresProvider';

APP_CONFIG.IS_STORYBOOK = true;
// В сторибуке отключаем enforceActions, чтобы моковые присвоения в сторах не падали в строгом режиме.
configure({enforceActions: 'never'});

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    i18n,
    locale: 'ru',
  },
  globalTypes: {
    darkMode: {
      defaultValue: true,
    },
  },
  decorators: [
    (Story) => {
      return (
        <StoresProvider>
          <I18nextProvider i18n={i18n}>
            <Story />
          </I18nextProvider>
        </StoresProvider>
      );
    },
  ],
};

export default preview;
