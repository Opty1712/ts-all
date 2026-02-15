import {apiClient} from '@/network/api';

import {RawAuthorBooksResponse, RawBookResponse, RawBooksResponse, UpdateBookFavoriteRequest} from './types';
import {booksListURL} from './urls';

export const getBooks = async () => {
  return apiClient.get<RawBooksResponse>(booksListURL);
};

export const getAuthorBooks = async ({authorId}: {authorId: string}) => {
  return apiClient.get<RawAuthorBooksResponse>(booksListURL, {author: authorId});
};

export const getBook = async ({authorId, bookId}: {authorId: string; bookId: string}) => {
  return apiClient.get<RawBookResponse>(booksListURL, {id: bookId, author: authorId});
};

export const updateBookFavorite = async (data: UpdateBookFavoriteRequest) => {
  return apiClient.post<RawBookResponse, UpdateBookFavoriteRequest>(`${booksListURL}/favorite`, data);
};
