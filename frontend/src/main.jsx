import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1048473216892-dummy.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid rgba(217, 70, 239, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
