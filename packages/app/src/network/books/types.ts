export type RawBook = {
  id: string;
  authorId: string;
  title: string;
  year: number;
  priceKopecks: number;
  isFavorite?: boolean;
};

export type Book = {
  id: string;
  authorId: string;
  title: string;
  year: number;
  price: number;
  isFavorite?: boolean;
};

export type RawAuthorBooksResponse = {
  books: Array<RawBook>;
};

export type RawBooksResponse = {
  books: Array<RawBook>;
};

export type AuthorBooksResponse = {
  books: Array<Book>;
};

export type RawBookResponse = {
  book: RawBook;
};

export type BookResponse = {
  book: Book;
};

export type UpdateBookFavoriteRequest = {
  id: string;
  isFavorite: boolean;
};
