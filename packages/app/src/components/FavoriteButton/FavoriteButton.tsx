import {IconFavorite20, IconFavoriteFilled20} from '@demo/icons';
import {useCssVariable} from '@demo/ui-kit';
import {FC} from 'react';
import {useTranslation} from 'react-i18next';

import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  isFavorite: boolean | undefined;
  onClick: () => void;
};

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  isFavorite,
  onClick,
}) => {
  const {t} = useTranslation();
  const hex = useCssVariable('--b2bColorsFillAccent');

  return (
    <button
      type="button"
      className={styles.favoriteButton}
      aria-label={isFavorite ? t('Убрать из избранного') : t('В избранное')}
      onClick={onClick}
      style={{color: hex}}
    >
      {isFavorite ? <IconFavoriteFilled20 /> : <IconFavorite20 />}
    </button>
  );
};
