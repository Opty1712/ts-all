import {FavoriteButton} from '@/components/FavoriteButton/FavoriteButton';
import pageListStyles from '@/components/PageList.module.css';
import {APP_ROUTES} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useRoute} from 'wouter';

export const AuthorBooksPage = observer(() => {
  const {$booksStore} = useStores();
  const {t} = useTranslation();
  const [, params] = useRoute(APP_ROUTES['/authors/author/:authorId/books'].path);
  const authorId = params?.authorId;

  useEffect(() => {
    if (!authorId) {
      return;
    }

    $booksStore.getAuthorBooks.run({authorId});
  }, [$booksStore, authorId]);

  if (!authorId) {
    return <p>{t('Автор не найден')}</p>;
  }

  if ($booksStore.getAuthorBooks.isLoading) {
    return <p>{t('Загрузка книг автора...')}</p>;
  }

  return (
    <section>
      <h1>{t('Книги автора')}</h1>
      <ul className={pageListStyles.list}>
        {$booksStore.getAuthorBooks.data?.map((book) => {
          const bookPath = APP_ROUTES['/authors/author/:authorId/books/:bookId'].getDynamic({
            authorId,
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
                      $booksStore.getAuthorBooks.run({authorId});
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
