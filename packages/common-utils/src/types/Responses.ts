export enum ResponseCode {
  ERROR = 'ERROR',
  OK = 'OK',
  NOT_FOUND = '404 NOT_FOUND',
}

export type ErrorMessage<TError> = {
  errorMessage: string;
  title: keyof TError;
};

export type ErrorMessages<TError = unknown> = {
  errorMessages: Array<ErrorMessage<TError>>;
};

export type ErrorResponse<TError = unknown, TBody = unknown> = {
  code: ResponseCode.ERROR;
  message: string;
  errorMessages?: Array<ErrorMessage<TError>>;
  timestamp: string;
  body: TBody;
  serviceStatusCode: number;
};
