import {FavoriteButton} from '@/components/FavoriteButton/FavoriteButton';
import pageListStyles from '@/components/PageList.module.css';
import {APP_ROUTES} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'wouter';

export const BooksPage = observer(() => {
  const {$booksStore} = useStores();
  const {t} = useTranslation();

  useEffect(() => {
    $booksStore.getBooks.run();
  }, [$booksStore]);

  if ($booksStore.getBooks.isLoading) {
    return <p>{t('Загрузка книг...')}</p>;
  }

  return (
    <section>
      <h1>{t('Книги')}</h1>
      <ul className={pageListStyles.list}>
        {$booksStore.getBooks.data?.map((book) => {
          const bookPath = APP_ROUTES['/authors/author/:authorId/books/:bookId'].getDynamic({
            authorId: book.authorId,
            bookId: book.id,
          });

          return (
            <li key={book.id} className={pageListStyles.listItem}>
              <Link href={bookPath}>
                {book.title} ({book.year}) - {book.price} {t('RUB')}
              </Link>
              <FavoriteButton
                isFavorite={book.isFavorite}
                onClick={() => {
                  $booksStore.updateBookFavorite.run({id: book.id, isFavorite: !book.isFavorite}).then((result) => {
                    if (result.status === 'success') {
                      $booksStore.getBooks.run();
                    }
                  });
                }}
              />
            </li>
          );
        })}
      </ul>
      <p>{t('Нажмите на иконку рядом с автором или книгой, чтобы посмотреть работу апдейтера.')}</p>
    </section>
  );
});
