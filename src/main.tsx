import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppProviders, AuthBootstrap } from '@/providers';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <AuthBootstrap>
        <App />
      </AuthBootstrap>
    </AppProviders>
  </StrictMode>
);
