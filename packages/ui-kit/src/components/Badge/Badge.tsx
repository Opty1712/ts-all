import {memo} from 'react';
import {keyof} from 'ts-keyof';

import {bgColors} from '../../styles/generated/TWClassNames';
import styles from './Badge.module.css';

type Variant = 'warning' | 'positive' | 'negative' | 'neutral' | 'accent';
type BgToken = (typeof bgColors)[number];

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
      <div className={variants[variant]} />
      <div className="rounded-borderRadiusXXL border-b2bColorsLineBase00 w-spacingXS">{children}</div>
    </div>
  );
});

Badge.displayName = keyof({Badge});

const variants: Record<Variant, BgToken> = {
  accent: 'bg-b2bColorsIconAccent',
  negative: 'bg-b2bColorsIconNegative',
  neutral: 'bg-b2bColorsIconBase10',
  positive: 'bg-b2bColorsIconPositive',
  warning: 'bg-b2bColorsIconWarning',
};
