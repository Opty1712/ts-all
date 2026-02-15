import {AuthorsStore} from './AuthorsStore';
import {BooksStore} from './BooksStore';
import {FeatureToggleStore} from './FeatureToggleStore';

export const createStores = () => ({
  $authorsStore: new AuthorsStore(),
  $booksStore: new BooksStore(),
  $omicronStore: new FeatureToggleStore(),
});

export type Stores = ReturnType<typeof createStores>;
