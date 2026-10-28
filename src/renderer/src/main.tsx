import '@fontsource/space-grotesk';
import './assets/main.css';

// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppConfigProvider from './context/AppConfigProvider';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AppConfigProvider>
    <App />
  </AppConfigProvider>
  // </StrictMode>
);
