import {APP_CONFIG} from '@/config/appConfig';
import {t} from '@/i18n/i18nHelper';
import {BaseErrorResponse} from '@/types/shared';
import wretch from 'wretch';
import {abortAddon, queryStringAddon} from 'wretch/addons';
import {WretchError} from 'wretch/resolver';

/** Создаем базового клиента, тут всякие авторизации и другие особенности вашего окружения */
const baseClient = wretch(APP_CONFIG.API_URL).addon(abortAddon()).addon(queryStringAddon).errorType('json');

/** Создаем стандартные методы CRUD */
export const apiClient = {
  get: async <ResponseBodyType, ErrorBodyType = null>(
    path: string,
    query: Record<string, unknown> | string = {},
  ): Promise<Answer<ResponseBodyType, ErrorBodyType>> => {
    try {
      const response = await baseClient.query(query).url(path).get().res();
      const data: ResponseBodyType = await response.json();

      return {data, error: null, code: response.status};
    } catch (error) {
      const code = error instanceof Error && 'status' in error ? Number(error.status) : 500;

      return {data: null, error: parseWretchError<ErrorBodyType>(error), code};
    }
  },

  post: async <ResponseBodyType, RequestBodyType = unknown, ErrorBodyType = null>(
    path: string,
    body: RequestBodyType,
  ): Promise<Answer<ResponseBodyType, ErrorBodyType>> => {
    try {
      const response = await baseClient.url(path).post(body).res();
      const result: ResponseBodyType = response.status === 204 ? {} : await response.json();

      return {data: result, error: null, code: response.status};
    } catch (error) {
      const code = error instanceof Error && 'status' in error ? Number(error.status) : 500;

      return {data: null, error: parseWretchError<ErrorBodyType>(error), code};
    }
  },

  base: baseClient,
};

export type Answer<ResponseBodyType, ErrorBodyType = null> = {
  data: ResponseBodyType | null;
  error: BaseErrorResponse<ErrorBodyType | null> | null;
  code: number;
};

/** Возвращаем всегда ошибку в виде объекта BaseErrorResponse,
 *  на страницах сможем вытаскивать все поля ответа в ключе error */
const parseWretchError = <ErrorBodyType>(error: unknown): BaseErrorResponse<ErrorBodyType | null> => {
  if (error instanceof WretchError) {
    return {code: 'ERROR', body: null, message: t('Произошла ошибка'), timestamp: Date.now().toString(), ...error.json};
  }

  if (error instanceof Error) {
    return {code: 'ERROR', body: null, message: error?.message, timestamp: Date.now().toString()};
  }

  return {code: 'ERROR', body: null, message: t('Произошла ошибка'), timestamp: Date.now().toString()};
};
