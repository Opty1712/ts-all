import {Layout} from '@/components/Layout/Layout';
import {Router} from '@/router/Router';
import {StoresProvider} from '@/stores/StoresProvider';
import {observer} from 'mobx-react-lite';

export const App = observer(() => {
  return (
    <StoresProvider>
      <Layout>
        <Router />
      </Layout>
    </StoresProvider>
  );
});
