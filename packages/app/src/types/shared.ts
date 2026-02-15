export type BaseErrorResponse<TBody = null> = {
  code: 'ERROR';
  message: string;
  timestamp: string;
  body: TBody;
};
