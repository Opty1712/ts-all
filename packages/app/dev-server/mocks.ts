import authorsMock from '../src/network/authors/mocks/authors.mock.json';
import {Author} from '../src/network/authors/types';
import booksMock from '../src/network/books/mocks/books.mock.json';
import {RawBook} from '../src/network/books/types';
import featureTogglesMock from '../src/network/featureToggles/mocks/featureToggles.mock.json';
import {FeatureToggle} from '../src/types/featureToggles';

export const authors = authorsMock as Array<Author>;
export const books = booksMock as Array<RawBook>;
export const featureToggles = featureTogglesMock as FeatureToggle;
