import {getAuthor, getAuthors, updateAuthorFavorite} from '@/network/authors/authorsApi';
import {Author, AuthorResponse, UpdateAuthorFavoriteRequest} from '@/network/authors/types';
import {makeObservable, observable} from 'mobx';

import {BaseStore, Getter, Updater} from './BaseStore';

type GetAuthorParams = {authorId: string};

export class AuthorsStore extends BaseStore {
  @observable public accessor getAuthors: Getter<void, {authors: Array<Author>}, Array<Author>>;
  @observable public accessor getAuthor: Getter<GetAuthorParams, {author: Author}, Author | null>;
  @observable public accessor updateAuthorFavorite: Updater<UpdateAuthorFavoriteRequest, AuthorResponse>;

  constructor() {
    super();
    makeObservable(this);

    this.getAuthors = this.createGetter<void, {authors: Array<Author>}, Array<Author>>({
      fetchFn: getAuthors,
      defaultData: [],
      adaptDataFromBackend: ({authors}) => authors,
    });

    this.getAuthor = this.createGetter<GetAuthorParams, {author: Author}, Author | null>({
      fetchFn: getAuthor,
      defaultData: null,
      adaptDataFromBackend: ({author}) => author,
    });

    this.updateAuthorFavorite = this.createUpdater<UpdateAuthorFavoriteRequest, AuthorResponse>(updateAuthorFavorite);
  }
}
