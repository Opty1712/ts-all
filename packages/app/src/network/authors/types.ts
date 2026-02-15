export type Author = {
  id: string;
  firstName: string;
  lastName: string;
  isFavorite?: boolean;
};

export type AuthorsResponse = {
  authors: Array<Author>;
};

export type AuthorResponse = {
  author: Author;
};

export type UpdateAuthorFavoriteRequest = {
  id: string;
  isFavorite: boolean;
};
