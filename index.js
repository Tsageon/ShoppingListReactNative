import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import App from './App';

registerRootComponent(() => (
  <Provider store={store}>
    <App />
  </Provider>
));
