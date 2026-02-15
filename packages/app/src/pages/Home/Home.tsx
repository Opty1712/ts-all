import {APP_ROUTES} from '@/router/routes';
import {Trans, useTranslation} from 'react-i18next';
import {Link} from 'wouter';

export const Home = () => {
  const {t} = useTranslation();

  return (
    <section>
      <h1>{t('Главная')}</h1>
      <p>
        <Trans i18nKey="<0>Страница книг</0> автоматически переключается в темную тему, потому что это задано в <1>router/routes.ts</1>.">
          <Link href={APP_ROUTES['/authors/books'].path} />
          <strong />
        </Trans>
      </p>
    </section>
  );
};
