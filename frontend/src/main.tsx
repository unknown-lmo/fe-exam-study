import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css'; // New design system
import './index.css'; // Legacy styles (to be migrated)
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
