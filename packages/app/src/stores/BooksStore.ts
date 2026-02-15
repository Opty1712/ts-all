import {adaptBookFromBackend} from '@/network/books/adaptBook';
import {getAuthorBooks, getBook, getBooks, updateBookFavorite} from '@/network/books/booksApi';
import {
  Book,
  RawAuthorBooksResponse,
  RawBookResponse,
  RawBooksResponse,
  UpdateBookFavoriteRequest,
} from '@/network/books/types';
import {makeObservable, observable} from 'mobx';

import {BaseStore, Getter, Updater} from './BaseStore';

type GetAuthorBooksParams = {authorId: string};
type GetBookParams = {authorId: string; bookId: string};

export class BooksStore extends BaseStore {
  @observable public accessor getBooks: Getter<void, RawBooksResponse, Array<Book>>;
  @observable public accessor getAuthorBooks: Getter<GetAuthorBooksParams, RawAuthorBooksResponse, Array<Book>>;
  @observable public accessor getBook: Getter<GetBookParams, RawBookResponse, Book | null>;
  @observable public accessor updateBookFavorite: Updater<UpdateBookFavoriteRequest, RawBookResponse>;

  constructor() {
    super();
    makeObservable(this);

    this.getBooks = this.createGetter<void, RawBooksResponse, Array<Book>>({
      fetchFn: getBooks,
      defaultData: [],
      adaptDataFromBackend: ({books}) => books.map(adaptBookFromBackend),
    });

    this.getAuthorBooks = this.createGetter<GetAuthorBooksParams, RawAuthorBooksResponse, Array<Book>>({
      fetchFn: getAuthorBooks,
      defaultData: [],
      adaptDataFromBackend: ({books}) => books.map(adaptBookFromBackend),
    });

    this.getBook = this.createGetter<GetBookParams, RawBookResponse, Book | null>({
      fetchFn: getBook,
      defaultData: null,
      adaptDataFromBackend: ({book}) => adaptBookFromBackend(book),
    });

    this.updateBookFavorite = this.createUpdater<UpdateBookFavoriteRequest, RawBookResponse>(updateBookFavorite);
  }
}
