import {FavoriteButton} from '@/components/FavoriteButton/FavoriteButton';
import {useFeatureToggles} from '@/hooks/useFeatureToggles';
import {APP_ROUTES} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useRoute} from 'wouter';

export const AuthorPage = observer(() => {
  const {$authorsStore} = useStores();
  const {ALLOWED_AUTHORS_ID} = useFeatureToggles();
  const {t} = useTranslation();
  const [, params] = useRoute(APP_ROUTES['/authors/author/:authorId'].path);
  const authorId = params?.authorId;

  useEffect(() => {
    if (!authorId) {
      return;
    }

    $authorsStore.getAuthor.run({authorId});
  }, [$authorsStore, authorId]);

  if (!authorId) {
    return <p>{t('Автор не найден')}</p>;
  }

  if ($authorsStore.getAuthor.isLoading) {
    return <p>{t('Загрузка автора...')}</p>;
  }

  const author = $authorsStore.getAuthor.data;

  if (!author) {
    return <p>{t('Автор не найден')}</p>;
  }

  if (ALLOWED_AUTHORS_ID.length > 0 && !ALLOWED_AUTHORS_ID.includes(author.id)) {
    return <p>{t('Автор не найден')}</p>;
  }

  const booksPath = APP_ROUTES['/authors/author/:authorId/books'].getDynamic(authorId);

  return (
    <section>
      <h1>
        {author.firstName} {author.lastName}
        <FavoriteButton
          isFavorite={author.isFavorite}
          onClick={() => {
            $authorsStore.updateAuthorFavorite.run({id: author.id, isFavorite: !author.isFavorite}).then((result) => {
              if (result.status === 'success') {
                $authorsStore.getAuthor.run({authorId});
              }
            });
          }}
        />
      </h1>
      <p>
        <Link href={booksPath}>{t('Все книги автора')}</Link>
      </p>
      <p>{t('Нажмите на иконку рядом с автором или книгой, чтобы посмотреть работу апдейтера.')}</p>
    </section>
  );
});
