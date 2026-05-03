/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {observer} from 'mobx-react-lite';
import {type ComponentType} from 'react';
import {Route, Switch} from 'wouter';

import {AuthorPage} from '../pages/Author/AuthorPage';
import {AuthorBooksPage} from '../pages/AuthorBooks/AuthorBooksPage';
import {AuthorsPage} from '../pages/Authors/AuthorsPage';
import {BookPage} from '../pages/Book/BookPage';
import {BooksPage} from '../pages/Books/BooksPage';
import {Home} from '../pages/Home/Home';

/**
 * Экспериментальный вариант типизированного роутинга для демо-проекта.
 *
 * В отличие от `routes.ts`, здесь route-конфиг хранит не только путь и
 * пользовательские `params`, но и обязательный `Component` для каждого
 * реального экрана. За счет этого `Router` ниже строится из того же дерева
 * роутов, а список `<Route />` не нужно поддерживать вручную отдельно.
 *
 * Промежуточные ветки без `Component`, например `/authors/author`, нужны
 * только для вложенности дерева и не попадают в `APP_ROUTES`.
 *
 * Фича экспериментальная: она показывает возможный контракт между роутами
 * и страницами, но еще не обкатана в продакшене.
 */
const routes = {
  '/': {
    Component: Home,
  },
  '/authors': {
    Component: AuthorsPage,
    '/books': {
      Component: BooksPage,
      params: {isDarkTheme: true},
    },
    '/author': {
      '/:authorId': {
        Component: AuthorPage,
        '/books': {
          Component: AuthorBooksPage,
          params: {isDarkTheme: true},
          '/:bookId': {
            Component: BookPage,
            params: {
              isDarkTheme: true,
              uid: '104533-3445',
              deprecatedAuthors: ['John Smith'],
            },
          },
        },
      },
    },
  },
} as const satisfies RoutesConfig;

/**
 * Типизированные роуты, каждый имеет:
 * - APP_ROUTES['/'].path; → статический урл
 * - APP_ROUTES['/'].getDynamic → динамический урл
 * - APP_ROUTES['/'].params → параметры роутера
 */
export const APP_ROUTES = flattenRoutes(routes) as AppRoutes;

/**
 * Экспериментальный Router, который выводится из `APP_ROUTES`.
 *
 * В обычном `Router.tsx` список страниц задается явно через набор `<Route />`.
 * Здесь каждая страница берется из `Component` внутри route-конфига, поэтому
 * добавление нового экрана требует изменения одного дерева роутов.
 *
 * Этот вариант оставлен как демо и пока не считается production-ready.
 */
export const Router = observer(() => (
  <Switch>
    {Object.values(APP_ROUTES).map(({path, Component}) => (
      <Route key={path} path={path}>
        <Component />
      </Route>
    ))}
  </Switch>
));

/**
 * Возвращает описание роута из `APP_ROUTES` для текущего pathname.
 * Сначала ищет точное совпадение, затем матчится по динамическим сегментам (`:param`).
 *
 * @example
 * // exact route
 * getRouteByPath('/authors/books')?.path;
 * // => '/authors/books'
 *
 * @example
 * // dynamic route
 * getRouteByPath('/authors/author/1/books/101')?.path;
 * // => '/authors/author/:authorId/books/:bookId'
 */
export const getRouteByPath = (
  pathname: string,
): ValueOf<AppRoutes> | undefined => {
  const normalizedPathname = normalizePathname(pathname);
  const exactRoute = APP_ROUTES[normalizedPathname as AppRouteLocations];

  if (exactRoute) {
    return exactRoute;
  }

  return Object.values(APP_ROUTES).find((route) => {
    const normalizedRoutePath = normalizePathname(route.path);

    const routeRegexp = new RegExp(
      `^${normalizedRoutePath.replace(/:[^/]+/g, '[^/]+')}$`,
    );

    return routeRegexp.test(normalizedPathname);
  });
};

/**
 * Возвращает значение параметра роута из `route.params`.
 * Если параметр не задан для конкретного роута, вернет `undefined`.
 */
export function getRouteParam<
  R extends ValueOf<AppRoutes>,
  P extends keyof R['params'],
>(route: R, param: P): R['params'][P];
export function getRouteParam<P extends RouteParamKey>(
  route: ValueOf<AppRoutes>,
  param: P,
): RouteParamValue<P> | undefined;

export function getRouteParam(route: ValueOf<AppRoutes>, param: RouteParamKey) {
  const params = route?.params as
    | Partial<Record<RouteParamKey, unknown>>
    | undefined;

  return params?.[param];
}

type RouteComponent = ComponentType;
type RouteMetaKey = 'Component' | 'params';

type RouteNode = (
  | {
      Component: RouteComponent;
      params?: Record<string, unknown>;
    }
  | {
      Component?: never;
      params?: never;
    }
) & {
  [K in `/${string}`]?: RouteNode;
};

type RoutesConfig = {
  [K in `/${string}`]: RouteNode;
};

type FlattenableRouteNode = {
  Component?: RouteComponent;
  params?: Record<string, unknown>;
} & {
  [K in `/${string}`]?: FlattenableRouteNode;
};

type Join<
  A extends string,
  B extends string,
> = `${A}${B extends `/${string}` ? B : `/${B}`}`;

type Flatten<T, Prefix extends string = ''> = {
  [K in keyof T]: K extends RouteMetaKey
    ? never
    : K extends string
      ? T[K] extends object
        ?
            | (T[K] extends {Component: RouteComponent}
                ? Join<Prefix, K>
                : never)
            | Flatten<T[K], Join<Prefix, K>>
        : Join<Prefix, K>
      : never;
}[keyof T];

export type AppRouteLocations = Flatten<typeof routes>;

type GetOwnParams<T> = T extends {params: infer Params} ? Params : {};

type GetParams<T, P extends string> = P extends keyof T
  ? GetOwnParams<T[P]>
  : P extends `/${infer Head}/${infer Tail}`
    ? `/${Head}` extends keyof T
      ? T[`/${Head}`] extends object
        ? GetParams<T[`/${Head}`], `/${Tail}`>
        : {}
      : {}
    : {};

type GetComponent<T, P extends string> = P extends keyof T
  ? T[P] extends {Component: infer Component}
    ? Component
    : never
  : P extends `/${infer Head}/${infer Tail}`
    ? `/${Head}` extends keyof T
      ? T[`/${Head}`] extends object
        ? GetComponent<T[`/${Head}`], `/${Tail}`>
        : never
      : never
    : never;

type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type ParamObject<T extends string> = {
  [K in ExtractParams<T>]: string;
};

type DynamicPath<T extends string> =
  ExtractParams<T> extends never
    ? () => string
    : (params: ParamObject<T> | string | Array<string>) => string;

export type AppRoutes = {
  [K in AppRouteLocations]: {
    path: K;
    params: GetParams<typeof routes, K>;
    Component: GetComponent<typeof routes, K>;
    getDynamic: DynamicPath<K>;
  };
};

function flattenRoutes<T extends object>(
  routes: T,
  base = '',
): Record<
  string,
  {path: string; params: any; Component: RouteComponent; getDynamic: any}
> {
  const result: Record<
    string,
    {path: string; params: any; Component: RouteComponent; getDynamic: any}
  > = {};

  for (const key in routes) {
    if (key === 'Component' || key === 'params') continue;

    const fullPath = base
      ? `${base}${key.startsWith('/') ? key : `/${key}`}`
      : key;

    const entry = routes[key as keyof T];

    const getDynamic =
      (path: string) =>
      (args?: ParamObject<string> | string | Array<string>) => {
        if (!args) return path;

        if (typeof args === 'string' || Array.isArray(args)) {
          const routes = Array.isArray(args) ? args : [args];
          let i = 0;

          return path.replace(/:([^/]+)/g, () => routes[i++] || '');
        }

        let resultPath = path;

        for (const [param, value] of Object.entries<string>(args)) {
          resultPath = resultPath.replace(`:${param}`, value);
        }

        return resultPath;
      };

    if (isRouteEntry(entry)) {
      result[fullPath] = {
        path: fullPath,
        Component: entry.Component,
        params: entry.params ?? {},
        getDynamic: getDynamic(fullPath),
      };
    }

    if (typeof entry === 'object' && entry !== null) {
      const nested = flattenRoutes(entry, fullPath);
      Object.assign(result, nested);
    }
  }

  return result;
}

function isRouteEntry(
  entry: unknown,
): entry is FlattenableRouteNode &
  Required<Pick<FlattenableRouteNode, 'Component'>> {
  return typeof entry === 'object' && entry !== null && 'Component' in entry;
}

type ValueOf<T> = T[keyof T];
type DeepRouteParamKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends 'params'
        ? keyof T[K]
        : K extends 'Component'
          ? never
          : T[K] extends object
            ? DeepRouteParamKeys<T[K]>
            : never;
    }[keyof T]
  : never;
type RouteParamKey = DeepRouteParamKeys<typeof routes>;

type RouteParamValue<P extends RouteParamKey> = Extract<
  ValueOf<AppRoutes>,
  {params: Record<P, unknown>}
>['params'][P];

const normalizePathname = (pathname: string): string => {
  const normalizedPathname = pathname.split('?')[0].split('#')[0] || '/';

  if (normalizedPathname.length > 1 && normalizedPathname.endsWith('/')) {
    return normalizedPathname.slice(0, -1);
  }

  return normalizedPathname;
};
