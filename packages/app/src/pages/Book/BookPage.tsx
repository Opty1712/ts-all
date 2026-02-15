import {FavoriteButton} from '@/components/FavoriteButton/FavoriteButton';
import {APP_ROUTES} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import {Badge} from '@demo/ui-kit';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useRoute} from 'wouter';

export const BookPage = observer(() => {
  const {$booksStore} = useStores();
  const {t} = useTranslation();
  const [, params] = useRoute(APP_ROUTES['/authors/author/:authorId/books/:bookId'].path);
  const authorId = params?.authorId;
  const bookId = params?.bookId;

  useEffect(() => {
    if (!authorId || !bookId) {
      return;
    }

    $booksStore.getBook.run({authorId, bookId});
  }, [$booksStore, authorId, bookId]);

  if (!authorId || !bookId) {
    return <p>{t('Книга не найдена')}</p>;
  }

  if ($booksStore.getBook.isLoading) {
    return <p>{t('Загрузка книги...')}</p>;
  }

  const book = $booksStore.getBook.data;

  if (!book) {
    return <p>{t('Книга не найдена')}</p>;
  }

  return (
    <section>
      <h1>
        {book.title}
        <FavoriteButton
          isFavorite={book.isFavorite}
          onClick={() => {
            $booksStore.updateBookFavorite.run({id: book.id, isFavorite: !book.isFavorite}).then((result) => {
              if (result.status === 'success') {
                $booksStore.getBook.run({authorId, bookId});
              }
            });
          }}
        />
      </h1>
      <Badge variant="accent">{t('Популярно')}</Badge>
      <p>
        {t('Год')}: {book.year}
      </p>
      <p>
        {t('Цена')}: {book.price} {t('RUB')}
      </p>
      <p>{t('Нажмите на иконку рядом с автором или книгой, чтобы посмотреть работу апдейтера.')}</p>
    </section>
  );
});
