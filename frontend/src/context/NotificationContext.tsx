import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({
      id: Date.now().toString(),
      message,
      type,
    });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, clearNotification }}>
      {children}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {notification ? (
          <Alert onClose={clearNotification} severity={notification.type} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
