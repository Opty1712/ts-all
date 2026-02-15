import cn from 'classnames';
import {memo} from 'react';
import {keyof} from 'ts-keyof';

import {bgColors} from '../../styles/generated/TWClassNames';
import styles from './Badge.module.css';

type Variant = 'warning' | 'positive' | 'negative' | 'neutral' | 'accent';

export type BadgeProps = {
  /** Цветовой вариант */
  variant: Variant;

  /** Ребенком может быть только строка */
  children?: string;
};

/** Компонент для отображения состояния (статуса) различных элементов */
export const Badge = memo<BadgeProps>(({variant, children}) => {
  return (
    <div className={styles.root}>
      <div
        className={cn(
          'border border-solid rounded-borderRadiusXXXL border-b2bColorsLineBase00 w-spacingXS h-spacingXS min-w-spacingXS',
          variants[variant],
        )}
      />
      <div className={styles.badgeText}>{children}</div>
    </div>
  );
});

Badge.displayName = keyof({Badge});

const variants: Record<Variant, (typeof bgColors)[number]> = {
  accent: 'bg-b2bColorsIconAccent',
  negative: 'bg-b2bColorsIconNegative',
  neutral: 'bg-b2bColorsIconBase10',
  positive: 'bg-b2bColorsIconPositive',
  warning: 'bg-b2bColorsIconWarning',
};
