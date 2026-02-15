import {useStores} from '@/stores/StoresProvider';
import {getKeyValueObjectFromStrings} from '@demo/common-utils';
import type {Decorator, Meta, StoryObj} from '@storybook/react';
import {useLayoutEffect} from 'react';

import {BooksPage} from './BooksPage';
import {BOOKS_PAGE_MOCKS} from './BooksPage.mocks';

interface ExtraArgs {
  booksMock: keyof typeof BOOKS_PAGE_MOCKS;
}

type BooksPageStoryArgs = Partial<ExtraArgs>;

const useDecorator: Decorator<BooksPageStoryArgs> = (Story, {args}) => {
  const {$booksStore} = useStores();

  useLayoutEffect(() => {
    $booksStore.getBooks.updateData(BOOKS_PAGE_MOCKS[args.booksMock ?? 'BOOKS_DEFAULT']);
  }, [$booksStore, args.booksMock]);

  return <Story args={args} />;
};

export default {
  title: 'Pages/Books/BooksPage',
  component: BooksPage,
  decorators: [useDecorator],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    booksMock: 'BOOKS_DEFAULT',
  },
  argTypes: {
    booksMock: {
      name: 'Мок списка книг',
      control: {
        type: 'select',
        labels: getKeyValueObjectFromStrings(Object.keys(BOOKS_PAGE_MOCKS)),
      },
      options: Object.keys(BOOKS_PAGE_MOCKS),
    },
  },
} satisfies Meta<typeof BooksPage>;

type Story = StoryObj<
  typeof BooksPage & {
    args: ExtraArgs;
  }
>;

export const Default: Story = {};
