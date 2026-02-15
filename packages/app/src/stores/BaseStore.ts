/* eslint-disable brace-style */
import {APP_CONFIG} from '@/config/appConfig';
import {Answer} from '@/network/api';
import {BaseErrorResponse} from '@/types/shared';
import stableStringify from 'fast-json-stable-stringify';
import {computed, makeObservable, observable, runInAction} from 'mobx';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type ErrorType<ErrorResponse> = BaseErrorResponse<ErrorResponse | null> | null;

export type UpdateResult<ExpectedResult, ErrorResponse> = {
  status: 'success' | 'error';
  error?: ErrorType<ErrorResponse>;
  result?: ExpectedResult;
  code?: number;
};

export interface Updater<DataToSend, ExpectedResult = DataToSend, ErrorResponse = null> {
  status: Status;
  error: ErrorType<ErrorResponse>;
  data?: ExpectedResult | null;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  run(data: DataToSend): Promise<UpdateResult<ExpectedResult, ErrorResponse>>;
}

class StoreUpdater<DataToSend, ExpectedResult = DataToSend, ErrorResponse = null>
  implements Updater<DataToSend, ExpectedResult, ErrorResponse>
{
  @observable accessor status: Status = 'idle';
  @observable accessor error: ErrorType<ErrorResponse> = null;
  @observable accessor data!: ExpectedResult;

  constructor(private updateFn: (data: DataToSend) => Promise<Answer<ExpectedResult, ErrorResponse>>) {
    makeObservable(this);
  }

  @computed get isIdle(): boolean {
    return this.status === 'idle';
  }

  @computed get isLoading(): boolean {
    return this.status === 'loading';
  }

  @computed get isSuccess(): boolean {
    return this.status === 'success';
  }

  @computed get isError(): boolean {
    return this.status === 'error';
  }

  async run(data: DataToSend): Promise<UpdateResult<ExpectedResult, ErrorResponse>> {
    runInAction(() => {
      this.status = 'loading';
      this.error = null;
    });

    let response;

    try {
      response = await this.updateFn(data);
      /* В этот catch попасть маловероятно, только, если использовать дефолтный клиент apiClient.base,
       который не обернут в try catch и не возвращает BaseErrorResponse */
    } catch (e) {
      const error: BaseErrorResponse = {
        code: 'ERROR',
        body: null,
        message: e.message,
        timestamp: Date.now().toString(),
      };

      runInAction(() => {
        this.status = 'error';
        this.error = error;
      });

      return {status: 'error', error, code: 500};
    }

    if (response.error) {
      runInAction(() => {
        this.status = 'error';
        this.error = response.error;
      });

      return {status: 'error', error: response.error, code: response.code};
    }

    if (response.data === null) {
      const error: BaseErrorResponse = {
        code: 'ERROR',
        body: null,
        message: 'Data is null',
        timestamp: Date.now().toString(),
      };

      runInAction(() => {
        this.status = 'error';
        this.error = error;
      });

      return {status: 'error', error, code: response.code};
    }

    const resultData = response.data;

    runInAction(() => {
      this.status = 'success';
      this.data = resultData;
    });

    return {status: 'success', result: response.data, code: response.code};
  }
}

export type GetResult<ExpectedResult, ErrorResponse = null> = {
  status: 'success' | 'error';
  error?: ErrorType<ErrorResponse>;
  result?: ExpectedResult;
  code?: number;
};

export interface Getter<
  TParams = void,
  FetchResult = unknown,
  AdaptedFetchResult = FetchResult,
  NonNullableData = false,
  ErrorResponse = null,
> {
  status: Status;
  error: ErrorType<ErrorResponse>;
  data: NonNullableData extends true ? AdaptedFetchResult : AdaptedFetchResult | null;
  date?: number;
  isIdle: boolean;
  code: number | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  run(params: TParams): Promise<GetResult<AdaptedFetchResult, ErrorResponse>>;
  reset(): void;
  updateData(data: AdaptedFetchResult): void;
}

interface BaseStoreOptionsNonNullable<FetchParams, FetchResult, AdaptedFetchResult, ErrorResponse> {
  fetchFn: (params: FetchParams) => Promise<Answer<FetchResult, ErrorResponse>>;
  staleTimeMs?: number;
  defaultData: AdaptedFetchResult;
  adaptDataFromBackend?: (data: FetchResult) => AdaptedFetchResult;
}

interface BaseStoreOptionsNullable<FetchParams, FetchResult, AdaptedFetchResult, ErrorResponse> {
  fetchFn: (params: FetchParams) => Promise<Answer<FetchResult, ErrorResponse>>;
  staleTimeMs?: number;
  defaultData?: AdaptedFetchResult | null;
  adaptDataFromBackend?: (data: FetchResult) => AdaptedFetchResult;
}

type BaseStoreOptions<
  FetchParams,
  FetchResult,
  AdaptedFetchResult = FetchResult,
  NonNullableData = false,
  ErrorResponse = null,
> = NonNullableData extends true
  ? BaseStoreOptionsNonNullable<FetchParams, FetchResult, AdaptedFetchResult, ErrorResponse>
  : BaseStoreOptionsNullable<FetchParams, FetchResult, AdaptedFetchResult, ErrorResponse>;

class StoreGetter<TParams, FetchResult, AdaptedFetchResult = FetchResult, NonNullableData = false, ErrorResponse = null>
  implements Getter<TParams, FetchResult, AdaptedFetchResult, NonNullableData, ErrorResponse>
{
  @observable accessor status: Status = 'idle';
  @observable accessor error: ErrorType<ErrorResponse> = null;
  @observable accessor data: NonNullableData extends true ? AdaptedFetchResult : AdaptedFetchResult | null;
  @observable accessor code: number | undefined;
  @observable accessor date!: number;

  private cache = new Map<string, {data: AdaptedFetchResult; timestamp: number; code: number | undefined}>();
  private staleTimeMs: number;
  private fetchFn: (params: TParams) => Promise<Answer<FetchResult, ErrorResponse>>;
  private defaultData: NonNullableData extends true ? AdaptedFetchResult : AdaptedFetchResult | null;
  private adaptDataFromBackend: (data: FetchResult) => AdaptedFetchResult;

  constructor(options: BaseStoreOptions<TParams, FetchResult, AdaptedFetchResult, NonNullableData, ErrorResponse>) {
    makeObservable(this);

    const {
      fetchFn,
      staleTimeMs = 0,
      defaultData = null,
      adaptDataFromBackend = (data: FetchResult) => data as unknown as AdaptedFetchResult,
    } = options;

    this.fetchFn = fetchFn;
    this.staleTimeMs = staleTimeMs;
    this.defaultData = defaultData as NonNullableData extends true ? AdaptedFetchResult : AdaptedFetchResult | null;
    this.adaptDataFromBackend = adaptDataFromBackend;
    this.data = defaultData as NonNullableData extends true ? AdaptedFetchResult : AdaptedFetchResult | null;
    this.code = undefined;
  }

  @computed get isIdle(): boolean {
    return this.status === 'idle';
  }

  @computed get isLoading(): boolean {
    return this.status === 'loading';
  }

  @computed get isSuccess(): boolean {
    return this.status === 'success';
  }

  @computed get isError(): boolean {
    return this.status === 'error';
  }

  /** Храним одинаковые запросы, выполняем их последовательно */
  private runningRequests = new Map<string, Promise<GetResult<AdaptedFetchResult, ErrorResponse>>>();

  async run(params: TParams): Promise<GetResult<AdaptedFetchResult, ErrorResponse>> {
    if (APP_CONFIG['IS_STORYBOOK']) {
      this.status = 'success';

      /** as в данном случае ОК, так как этот IF используем только для моков */
      return {status: 'success', code: 200, result: this.data as AdaptedFetchResult};
    }

    const key = stableStringify(params ?? ({} as TParams));
    const now = Date.now();

    if (this.staleTimeMs > 0) {
      const entry = this.cache.get(key);

      if (entry && now - entry.timestamp < this.staleTimeMs) {
        runInAction(() => {
          this.data = entry.data;
          this.status = 'success';
          this.code = entry.code;
        });

        return {status: 'success', result: entry.data, code: entry.code};
      }
    }

    if (this.runningRequests.has(key)) {
      try {
        const existingPromise = this.runningRequests.get(key);

        const runNextRequest = async () => {
          this.runningRequests.delete(key);

          return this.run(params);
        };

        if (!existingPromise) {
          return runNextRequest();
        }

        const result = await existingPromise;

        if (!result) {
          return runNextRequest();
        }

        const entry = this.cache.get(key);

        if (entry && now - entry.timestamp < this.staleTimeMs) {
          runInAction(() => {
            this.data = entry.data;
            this.status = 'success';
            this.code = entry.code;
          });

          return {status: 'success', result: entry.data, code: entry.code};
        }

        return result;
      } finally {
        this.runningRequests.delete(key);
      }
    }

    const promise = (async (): Promise<GetResult<AdaptedFetchResult, ErrorResponse>> => {
      runInAction(() => {
        this.status = 'loading';
        this.error = null;
      });

      let response;

      try {
        response = await this.fetchFn(params);
        /**
         * В этот catch попасть маловероятно, только, если использовать дефолтный клиент apiClient.base,
         * который не обернут в try catch и не возвращает BaseErrorResponse
         */
      } catch (e) {
        const error: BaseErrorResponse = {
          code: 'ERROR',
          body: null,
          message: e.message,
          timestamp: Date.now().toString(),
        };

        runInAction(() => {
          this.status = 'error';
          this.data = this.defaultData;
          this.error = error;
          this.code = 500;
        });

        return {status: 'error', error, code: 500};
      }

      this.runningRequests.delete(key);

      if (response.error) {
        runInAction(() => {
          this.status = 'error';
          this.error = response.error;
          this.data = this.defaultData;
          this.code = response.code;
        });

        return {
          status: 'error',
          error: response.error,
          code: response.code,
        };
      }

      if (response.data === null) {
        const error: BaseErrorResponse = {
          code: 'ERROR',
          body: null,
          message: 'Data is null',
          timestamp: Date.now().toString(),
        };

        runInAction(() => {
          this.status = 'error';
          this.error = error;
          this.data = this.defaultData;
          this.code = response.code;
        });

        return {status: 'error', error, code: response.code};
      }

      const adapted = this.adaptDataFromBackend(response.data);

      runInAction(() => {
        this.data = adapted;
        this.date = now;
        this.status = 'success';
        this.code = response.code;

        if (this.staleTimeMs > 0) {
          this.cache.set(key, {data: adapted, timestamp: now, code: response.code});
        }
      });

      return {
        status: 'success',
        result: adapted,
        code: response.code,
      };
    })();

    this.runningRequests.set(key, promise);

    return await promise;
  }

  reset(): void {
    runInAction(() => {
      this.cache.clear();
      this.data = this.defaultData;
      this.date = 0;
      this.status = 'idle';
      this.code = undefined;
    });
  }

  public updateData(data: AdaptedFetchResult): void {
    runInAction(() => {
      this.data = data;
    });
  }
}

/** Представляет из себя 2 фабрики для создания геттеров и апдейторов */
export class BaseStore {
  constructor() {
    makeObservable(this);
  }

  protected createUpdater<DataToSend, ExpectedResult = DataToSend, ErrorResponse = null>(
    updateFn: (data: DataToSend) => Promise<Answer<ExpectedResult, ErrorResponse>>,
  ): Updater<DataToSend, ExpectedResult, ErrorResponse> {
    return new StoreUpdater<DataToSend, ExpectedResult, ErrorResponse>(updateFn);
  }

  protected createGetter<
    TParams,
    FetchResult,
    AdaptedFetchResult = FetchResult,
    NonNullableData = false,
    ErrorResponse = null,
  >(
    options: BaseStoreOptions<TParams, FetchResult, AdaptedFetchResult, NonNullableData, ErrorResponse>,
  ): Getter<TParams, FetchResult, AdaptedFetchResult, NonNullableData, ErrorResponse> {
    return new StoreGetter<TParams, FetchResult, AdaptedFetchResult, NonNullableData, ErrorResponse>(options);
  }
}
