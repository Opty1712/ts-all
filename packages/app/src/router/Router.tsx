import {observer} from 'mobx-react-lite';
import {Route, Switch} from 'wouter';

import {AuthorPage} from '../pages/Author/AuthorPage';
import {AuthorBooksPage} from '../pages/AuthorBooks/AuthorBooksPage';
import {AuthorsPage} from '../pages/Authors/AuthorsPage';
import {BookPage} from '../pages/Book/BookPage';
import {BooksPage} from '../pages/Books/BooksPage';
import {Home} from '../pages/Home/Home';
import {APP_ROUTES} from './routes';

export const Router = observer(() => {
  return (
    <Switch>
      <Route path={APP_ROUTES['/'].path} component={Home} />
      <Route path={APP_ROUTES['/authors'].path} component={AuthorsPage} />
      <Route path={APP_ROUTES['/authors/books'].path} component={BooksPage} />
      <Route path={APP_ROUTES['/authors/author/:authorId'].path} component={AuthorPage} />
      <Route path={APP_ROUTES['/authors/author/:authorId/books'].path} component={AuthorBooksPage} />
      <Route path={APP_ROUTES['/authors/author/:authorId/books/:bookId'].path} component={BookPage} />
    </Switch>
  );
});
