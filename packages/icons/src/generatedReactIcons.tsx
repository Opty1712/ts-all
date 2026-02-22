import React, {DetailedHTMLProps, FC} from 'react';

import {SomeVKProject} from './generatedTypes';
import styles from './styles.module.css';

type IconSet = Record<
  keyof typeof SomeVKProject,
  FC<DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>>
>;

function getKeys<T extends Record<string | number | symbol, unknown>>(object: T): Array<keyof T> {
  return Object.keys(object) as Array<keyof T>;
}

const capsAndDigits = /(\d+|[A-Z])/g;

const getIconSet = () => {
  const iconSet = getKeys(SomeVKProject).reduce<IconSet>((accumulator, name) => {
    const a11yName = name.replace(capsAndDigits, ' $&');

    accumulator[name] = ({className = '', ...props}) => {
      return (
        <>
          <i aria-hidden="true" {...props} className={`${SomeVKProject[name]} ${className}`} />
          <span className={styles.srOnly}>{a11yName}</span>
        </>
      );
    };

    return accumulator;
  }, {} as IconSet);

  return iconSet;
};

const icons = getIconSet();
export const {
  IconAdd12,
  IconAdd16,
  IconAdd20,
  IconAdd24,
  IconErrorCircleFilled16,
  IconErrorCircleFilled20,
  IconErrorCircleFilled24,
  IconFavorite16,
  IconFavorite20,
  IconFavorite24,
  IconFavoriteFilled16,
  IconFavoriteFilled20,
  IconFavoriteFilled24,
  IconInfo12,
  IconInfo16,
  IconInfo20,
  IconInfo24,
  IconUser16,
  IconUser20,
  IconUser24,
} = icons;
