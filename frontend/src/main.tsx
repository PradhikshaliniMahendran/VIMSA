import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.ts';
import { setupInterceptors } from './services/api.ts';
import App from './App.tsx';
import './index.css';

// Initialize internationalization setup (i18n)
import './i18n/index.ts';

// Run Axios interceptor configuration with Redux store
setupInterceptors(store);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* Global Toast configurations with premium styling */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111111',
              color: '#ffffff',
              border: '1px solid rgba(212,175,55,0.2)',
              fontFamily: 'Outfit, sans-serif',
              textTransform: 'uppercase',
              fontSize: '11px',
              letterSpacing: '0.05em',
            },
          }}
        />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
