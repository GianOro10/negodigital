import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#16161A',
              color: '#F0EDE6',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
            },
            success: {
              iconTheme: { primary: '#59FFB4', secondary: '#0A0A0C' },
            },
            error: {
              iconTheme: { primary: '#FF6B6B', secondary: '#0A0A0C' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
