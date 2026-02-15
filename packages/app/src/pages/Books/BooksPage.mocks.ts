import {adaptBookFromBackend} from '@/network/books/adaptBook';
import booksAlternativeMockJson from '@/network/books/mocks/books.alternative.mock.json';
import booksMockJson from '@/network/books/mocks/books.mock.json';
import {Book, RawBook} from '@/network/books/types';

export const BOOKS_DEFAULT: Array<Book> = (booksMockJson as Array<RawBook>).map(adaptBookFromBackend);

export const BOOKS_ALTERNATIVE: Array<Book> = (booksAlternativeMockJson as Array<RawBook>).map(adaptBookFromBackend);

type BooksMocksType = 'BOOKS_DEFAULT' | 'BOOKS_ALTERNATIVE';

export const BOOKS_PAGE_MOCKS: Record<BooksMocksType, Array<Book>> = {
  BOOKS_DEFAULT,
  BOOKS_ALTERNATIVE,
};
