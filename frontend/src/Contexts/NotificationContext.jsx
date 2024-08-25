import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null);
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const addNotification = useCallback((newNotification) => {
    setNotifications(prev => {
      // Verifica se esiste già una notifica con lo stesso inviteId
      const exists = prev.some(n => n.inviteId === newNotification.inviteId);
      if (exists) {
        return prev; // Non aggiungere se esiste già
      }
      return [newNotification, ...prev];
    });
  }, []);

  const removeNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const checkInvites = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`/api/users/check-invites?userId=${user.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data.invites)) {
        response.data.invites.forEach(invite => {
          addNotification({
            type: 'invite',
            message: `Hai un nuovo invito al gruppo "${invite.groupName || 'Sconosciuto'}"!`,
            inviteId: invite.id
          });
        });
      } else if (response.data.hasNewInvite) {
        addNotification({
          type: 'invite',
          message: 'Hai un nuovo invito a un gruppo!',
          inviteId: 'generic-invite'
        });
      }
    } catch (error) {
      console.error('Errore nel controllo degli inviti:', error);
    }
  }, [isAuthenticated, user, getAccessTokenSilently, addNotification]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 2000);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkInvites();
      const interval = setInterval(checkInvites, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, checkInvites]);

  return (
    <NotificationContext.Provider value={{ 
      checkInvites, 
      addNotification, 
      removeNotification, 
      notifications,
      showAlert
    }}>
      {children}
      {alert && (
        <div className={`fixed top-4 right-4 p-4 rounded-md text-white ${
          alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {alert.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};