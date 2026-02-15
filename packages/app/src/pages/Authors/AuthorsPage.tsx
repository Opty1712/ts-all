import {FavoriteButton} from '@/components/FavoriteButton/FavoriteButton';
import pageListStyles from '@/components/PageList.module.css';
import {useFeatureToggles} from '@/hooks/useFeatureToggles';
import {APP_ROUTES} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'wouter';

export const AuthorsPage = observer(() => {
  const {$authorsStore} = useStores();
  const {ALLOWED_AUTHORS_ID} = useFeatureToggles();
  const {t} = useTranslation();

  useEffect(() => {
    $authorsStore.getAuthors.run();
  }, [$authorsStore]);

  if ($authorsStore.getAuthors.isLoading) {
    return <p>{t('Загрузка авторов...')}</p>;
  }

  const filteredAuthors =
    ALLOWED_AUTHORS_ID.length > 0
      ? ($authorsStore.getAuthors.data ?? []).filter((author) => ALLOWED_AUTHORS_ID.includes(author.id))
      : ($authorsStore.getAuthors.data ?? []);

  return (
    <section>
      <h1>{t('Авторы')}</h1>
      <ul className={pageListStyles.list}>
        {filteredAuthors.map((author) => {
          const authorPath = APP_ROUTES['/authors/author/:authorId'].getDynamic(author.id);

          return (
            <li key={author.id} className={pageListStyles.listItem}>
              <Link href={authorPath}>
                {author.firstName} {author.lastName}
              </Link>
              <FavoriteButton
                isFavorite={author.isFavorite}
                onClick={() => {
                  $authorsStore.updateAuthorFavorite
                    .run({id: author.id, isFavorite: !author.isFavorite})
                    .then((result) => {
                      if (result.status === 'success') {
                        $authorsStore.getAuthors.run();
                      }
                    });
                }}
              />
            </li>
          );
        })}
      </ul>
      <p>
        {t(
          'На этой странице автор «Depreacted By Feature Toggle Service» исключен через feature toggle, поэтому вы его не увидите, хотя с бэка он приходит.',
        )}
      </p>
      <p>{t('Нажмите на иконку рядом с автором или книгой, чтобы посмотреть работу апдейтера.')}</p>
    </section>
  );
});
