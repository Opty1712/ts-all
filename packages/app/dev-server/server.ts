/* eslint-disable no-console */
/**
 * Сервер чисто для запуска демо-приложения, он просто отдает JSON
 * При старте считывает моки и хранит их в памяти, и через POST в них можно менять любимы книги и авторы
 * */
import {createServer, IncomingMessage, ServerResponse} from 'node:http';

import {authors, books, featureToggles} from './mocks';

const DEFAULT_PORT = 3101;
const DEFAULT_API_PREFIX = '/api';

const json = (res: ServerResponse, statusCode: number, payload: unknown) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  res.end(JSON.stringify(payload));
};

const notFound = (res: ServerResponse) => {
  json(res, 404, {message: 'Not found'});
};

const getRequestData = (req: IncomingMessage) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);

  return {
    pathname: url.pathname,
    searchParams: url.searchParams,
  };
};

const stripApiPrefix = (pathname: string, apiPrefix: string) => {
  const normalizedPrefix = apiPrefix.endsWith('/') ? apiPrefix.slice(0, -1) : apiPrefix;

  if (!pathname.startsWith(normalizedPrefix)) {
    return pathname;
  }

  const routePath = pathname.slice(normalizedPrefix.length);

  return routePath || '/';
};

const readJsonBody = async <T>(req: IncomingMessage): Promise<T | null> => {
  const chunks: Array<Buffer> = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T;
};

export const startMockServer = (port = DEFAULT_PORT, apiPrefix = DEFAULT_API_PREFIX) => {
  const authorsState = authors.map((author) => ({...author}));
  const booksState = books.map((book) => ({...book}));

  const server = createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      json(res, 204, null);

      return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
      json(res, 405, {message: 'Method not allowed'});

      return;
    }

    const {pathname, searchParams} = getRequestData(req);

    if (pathname === '/' || pathname === '/health') {
      json(res, 200, {status: 'ok'});

      return;
    }

    const routePath = stripApiPrefix(pathname, apiPrefix);

    if (routePath === '/feature-toggles') {
      json(res, 200, featureToggles);

      return;
    }

    if (routePath === '/authors') {
      const id = searchParams.get('id');

      if (id) {
        const author = authorsState.find((item) => item.id === id);

        if (!author) {
          notFound(res);

          return;
        }

        json(res, 200, {author});

        return;
      }

      json(res, 200, {authors: authorsState});

      return;
    }

    if (routePath === '/authors/favorite' && req.method === 'POST') {
      readJsonBody<{id: string; isFavorite: boolean}>(req)
        .then((body) => {
          if (!body?.id || typeof body.isFavorite !== 'boolean') {
            json(res, 400, {message: 'Invalid payload'});

            return;
          }

          const author = authorsState.find((item) => item.id === body.id);

          if (!author) {
            notFound(res);

            return;
          }

          author.isFavorite = body.isFavorite;
          json(res, 200, {author});
        })
        .catch(() => {
          json(res, 400, {message: 'Invalid JSON'});
        });

      return;
    }

    if (routePath === '/books') {
      const id = searchParams.get('id');
      const author = searchParams.get('author');

      if (id) {
        const book = booksState.find((item) => {
          if (author) {
            return item.id === id && item.authorId === author;
          }

          return item.id === id;
        });

        if (!book) {
          notFound(res);

          return;
        }

        json(res, 200, {book});

        return;
      }

      const filteredBooks = author ? booksState.filter((item) => item.authorId === author) : booksState;

      json(res, 200, {books: filteredBooks});

      return;
    }

    if (routePath === '/books/favorite' && req.method === 'POST') {
      readJsonBody<{id: string; isFavorite: boolean}>(req)
        .then((body) => {
          if (!body?.id || typeof body.isFavorite !== 'boolean') {
            json(res, 400, {message: 'Invalid payload'});

            return;
          }

          const book = booksState.find((item) => item.id === body.id);

          if (!book) {
            notFound(res);

            return;
          }

          book.isFavorite = body.isFavorite;
          json(res, 200, {book});
        })
        .catch(() => {
          json(res, 400, {message: 'Invalid JSON'});
        });

      return;
    }

    notFound(res);
  });

  server.listen(port, () => {
    console.log(`[mock-server] listening on http://localhost:${port}${apiPrefix}`);
  });

  return server;
};

startMockServer(DEFAULT_PORT, DEFAULT_API_PREFIX);
