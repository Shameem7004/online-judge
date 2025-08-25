import { createContext, useState, useContext } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const addNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};