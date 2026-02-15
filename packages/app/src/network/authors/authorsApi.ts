import {apiClient} from '@/network/api';

import {AuthorResponse, AuthorsResponse, UpdateAuthorFavoriteRequest} from './types';
import {authorsListURL} from './urls';

export const getAuthors = async () => {
  return apiClient.get<AuthorsResponse>(authorsListURL);
};

export const getAuthor = async ({authorId}: {authorId: string}) => {
  return apiClient.get<AuthorResponse>(authorsListURL, {id: authorId});
};

export const updateAuthorFavorite = async (data: UpdateAuthorFavoriteRequest) => {
  return apiClient.post<AuthorResponse, UpdateAuthorFavoriteRequest>(`${authorsListURL}/favorite`, data);
};
