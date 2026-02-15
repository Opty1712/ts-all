import '@demo/icons/dist/style.css';
import '@demo/ui-kit/lib/style.css';
import ReactDOM from 'react-dom/client';

import {App} from './App';
import './config/appConfig';
import './global.css';
import './i18n';

const root = document.getElementById('root');

root && ReactDOM.createRoot(root).render(<App />);
