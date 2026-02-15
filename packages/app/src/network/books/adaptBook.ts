import {Book, RawBook} from './types';

export const adaptBookFromBackend = (book: RawBook): Book => {
  const {priceKopecks, ...rest} = book;

  return {
    ...rest,
    price: priceKopecks / 100,
  };
};
