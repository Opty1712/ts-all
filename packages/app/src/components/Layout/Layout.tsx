import {APP_ROUTES, getRouteByPath, getRouteParam} from '@/router/routes';
import {useStores} from '@/stores/StoresProvider';
import classnames from 'classnames';
import {observer} from 'mobx-react-lite';
import {FC, PropsWithChildren, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'wouter';

import styles from './Layout.module.css';
import {layoutDataTestIds} from './LayoutData.testIds';

export const Layout: FC<PropsWithChildren> = observer(({children}) => {
  const {t, i18n} = useTranslation();
  const {$omicronStore} = useStores();
  const [location, navigate] = useLocation();
  const currentRoute = getRouteByPath(location);
  const isDarkThemeALlowedByToggle = $omicronStore.getOmicronConfig.data.DARK_THEME_ENABLED;
  const isDarkThemeRoute = currentRoute ? getRouteParam(currentRoute, 'isDarkTheme') : false;
  const isDarkTheme = isDarkThemeALlowedByToggle && isDarkThemeRoute;
  const currentLanguage = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'ru';

  useEffect(() => {
    $omicronStore.getOmicronConfig.run();
  }, [$omicronStore]);

  const menuItems = [
    {label: t('Главная'), path: APP_ROUTES['/'].path, testId: layoutDataTestIds.menuTopHome},
    {label: t('Авторы'), path: APP_ROUTES['/authors'].path, testId: layoutDataTestIds.menuTopAuthors},
    {label: t('Книги'), path: APP_ROUTES['/authors/books'].path, testId: layoutDataTestIds.menuTopBooks},
  ];

  return (
    <div className={classnames(styles.layout, isDarkTheme && styles.layoutDark)}>
      <header className={styles.header}>
        <nav className={styles.menu}>
          {menuItems.map((item) => {
            const isActive = location === item.path;

            return (
              <button
                key={item.path}
                className={classnames(styles.menuItem, isActive && styles.menuItemActive)}
                type="button"
                data-testid={item.testId}
                onClick={() => {
                  navigate(item.path);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className={styles.title}>{t('Демо апп')}</div>
        <div className={styles.localeSwitcher}>
          <button
            type="button"
            className={classnames(styles.localeButton, currentLanguage === 'ru' && styles.localeButtonActive)}
            onClick={() => {
              i18n.changeLanguage('ru');
            }}
          >
            RU
          </button>
          <button
            type="button"
            className={classnames(styles.localeButton, currentLanguage === 'en' && styles.localeButtonActive)}
            onClick={() => {
              i18n.changeLanguage('en');
            }}
          >
            EN
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
});
