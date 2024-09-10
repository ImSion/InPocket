import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import axiosApi from '../Modules/Axios.js'; 

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null);
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const API_URL = 'https://inpocket.onrender.com/api' || 'http://localhost:5001/api';

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
    if (!isAuthenticated || !user) {
      console.log('Utente non autenticato o dati mancanti');
      return;
    }
  
    try {
      console.log('Inizio controllo inviti per:', user.sub);
      const token = await getAccessTokenSilently();
      console.log('Token ottenuto');
      
      const response = await axiosApi.get(`${API_URL}/users/check-invites?userId=${user.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Risposta ricevuta:', response.data);
  
      if (Array.isArray(response.data.invites)) {
        response.data.invites.forEach(invite => {
          console.log('Aggiunta notifica per invito:', invite);
          addNotification({
            type: 'invite',
            message: `Hai un nuovo invito al gruppo "${invite.groupName || 'Sconosciuto'}"!`,
            inviteId: invite.id
          });
        });
      } else if (response.data.hasNewInvite) {
        console.log('Aggiunta notifica generica per nuovo invito');
        addNotification({
          type: 'invite',
          message: 'Hai un nuovo invito a un gruppo!',
          inviteId: 'generic-invite'
        });
      }
    } catch (error) {
      console.error('Errore nel controllo degli inviti:', error);
      console.error('Dettagli errore:', error.response?.data);
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