import '@demo/icons/dist/style.css';
import {Preview} from '@storybook/react';
import {useEffect} from 'react';

import '../src/styles/generated/tailwindInitialFile.css';

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: (a, b) => (a.id === b.id ? 0 : a.id.localeCompare(b.id, undefined, {numeric: true})),
    },
  },
  globalTypes: {
    darkMode: {
      defaultValue: true,
    },
  },
  decorators: [
    (Story, {globals}) => {
      useEffect(() => {
        /** добавляем или убираем признак темной темы */
        globals.darkMode
          ? document.documentElement.classList.add('dark')
          : document.documentElement.classList.remove('dark');
      }, [globals.darkMode]);

      return <Story />;
    },
  ],
};

export default preview;
