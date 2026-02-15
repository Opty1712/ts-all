import {IconAdd20, IconErrorCircleFilled20} from '@demo/icons';
import {FC} from 'react';
import {useTranslation} from 'react-i18next';

import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  isFavorite: boolean | undefined;
  onClick: () => void;
};

export const FavoriteButton: FC<FavoriteButtonProps> = ({isFavorite, onClick}) => {
  const {t} = useTranslation();

  return (
    <button
      type="button"
      className={styles.favoriteButton}
      aria-label={isFavorite ? t('Убрать из избранного') : t('В избранное')}
      onClick={onClick}
    >
      {isFavorite ? <IconErrorCircleFilled20 /> : <IconAdd20 />}
    </button>
  );
};
