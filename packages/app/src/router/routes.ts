/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

const routes = {
  '/': {},
  '/authors': {
    '/books': {config: {isDarkTheme: true}},
    '/author': {
      '/:authorId': {
        '/books': {
          config: {isDarkTheme: true},
          '/:bookId': {
            config: {
              isDarkTheme: true,
              uid: '104533-3445',
              deprecatedAuthors: ['John Smith'],
            },
          },
        },
      },
    },
  },
} as const satisfies RouteNode;

/**
 * Типизированные роуты, каждый имеет:
 * - APP_ROUTES['/'].path; → статический урл
 * - APP_ROUTES['/'].getDynamic → динамический урл
 * - APP_ROUTES['/'].config → параметры роутера
 */
export const APP_ROUTES = flattenRoutes(routes) as AppRoutes;

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
 * Возвращает значение параметра роута из `route.config`.
 * Если параметр не задан для конкретного роута, вернет `undefined`.
 */
export function getRouteConfig<
  R extends ValueOf<AppRoutes>,
  P extends keyof R['config'],
>(route: R, param: P): R['config'][P];
export function getRouteConfig<P extends RouteParamKey>(
  route: ValueOf<AppRoutes>,
  param: P,
): RouteParamValue<P> | undefined;

export function getRouteConfig(
  route: ValueOf<AppRoutes>,
  param: RouteParamKey,
) {
  const config = route?.config as
    | Partial<Record<RouteParamKey, unknown>>
    | undefined;

  return config?.[param];
}

type RouteNode = {
  config?: Record<string, unknown>;
} & {
  [K in `/${string}`]?: RouteNode;
};

type Join<
  A extends string,
  B extends string,
> = `${A}${B extends `/${string}` ? B : `/${B}`}`;

type Flatten<T, Prefix extends string = ''> = {
  [K in keyof T]: K extends 'config'
    ? never
    : K extends string
      ? T[K] extends object
        ? Join<Prefix, K> | Flatten<T[K], Join<Prefix, K>>
        : Join<Prefix, K>
      : never;
}[keyof T];

export type AppRouteLocations = Flatten<typeof routes>;

type GetOwnconfig<T> = T extends {config: infer config} ? config : {};

type Getconfig<T, P extends string> = P extends keyof T
  ? GetOwnconfig<T[P]>
  : P extends `/${infer Head}/${infer Tail}`
    ? `/${Head}` extends keyof T
      ? T[`/${Head}`] extends object
        ? Getconfig<T[`/${Head}`], `/${Tail}`>
        : {}
      : {}
    : {};

type Extractconfig<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | Extractconfig<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type ParamObject<T extends string> = {
  [K in Extractconfig<T>]: string;
};

type DynamicPath<T extends string> =
  Extractconfig<T> extends never
    ? () => string
    : (config: ParamObject<T> | string | Array<string>) => string;

export type AppRoutes = {
  [K in AppRouteLocations]: {
    path: K;
    config: Getconfig<typeof routes, K>;
    getDynamic: DynamicPath<K>;
  };
};

function flattenRoutes<T extends object>(
  routes: T,
  base = '',
): Record<string, {path: string; config: any; getDynamic: any}> {
  const result: Record<string, {path: string; config: any; getDynamic: any}> =
    {};

  for (const key in routes) {
    if (key === 'config') continue;

    const fullPath = base
      ? `${base}${key.startsWith('/') ? key : `/${key}`}`
      : key;

    const entry = routes[key as keyof T];

    const config =
      typeof entry === 'object' && entry !== null && 'config' in entry
        ? (entry as any).config
        : {};

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

    result[fullPath] = {
      path: fullPath,
      config,
      getDynamic: getDynamic(fullPath),
    };

    if (typeof entry === 'object' && entry !== null) {
      const nested = flattenRoutes(entry, fullPath);
      Object.assign(result, nested);
    }
  }

  return result;
}

type ValueOf<T> = T[keyof T];
type DeepRouteParamKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends 'config'
        ? keyof T[K]
        : T[K] extends object
          ? DeepRouteParamKeys<T[K]>
          : never;
    }[keyof T]
  : never;
type RouteParamKey = DeepRouteParamKeys<typeof routes>;

type RouteParamValue<P extends RouteParamKey> = Extract<
  ValueOf<AppRoutes>,
  {config: Record<P, unknown>}
>['config'][P];

const normalizePathname = (pathname: string): string => {
  const normalizedPathname = pathname.split('?')[0].split('#')[0] || '/';

  if (normalizedPathname.length > 1 && normalizedPathname.endsWith('/')) {
    return normalizedPathname.slice(0, -1);
  }

  return normalizedPathname;
};
