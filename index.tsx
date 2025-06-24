import React from 'react';
import { createRoot } from 'react-dom/client'; // Changed back to use createRoot from react-dom/client
import App from './App';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement); // Use the imported createRoot directly
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);