import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket = null;

    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      // Assume API URL ends in /api but socket needs root
      const url = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '') 
        : 'http://localhost:5000';

      // Connect to Socket.io server
      newSocket = io(url, {
        auth: { token },
        reconnection: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to real-time notification server');
      });

      // Global listener for all push notifications
      newSocket.on('new_notification', (data) => {
        // Display toast notification
        toast(data.message, {
          icon: data.type === 'potential_match' ? '✨' : 
                data.type === 'new_claim' ? '📝' : '🔔',
          duration: 6000,
          style: {
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(88,28,135,0.9), rgba(67,56,202,0.9))',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
        });
      });

      newSocket.on('connect_error', (err) => {
        console.error('Real-time connection error:', err.message);
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or logout
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
