// src/hooks/useUserData.js
import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { getUserByEmail, getUserByAuth0Id } from '../Modules/ApiCrud';

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && !isLoading && user) {
        try {
          let data;
          // Prova prima con l'Auth0 ID
          data = await getUserByAuth0Id(user.sub);
          if (!data && user.email) {
            // Se non trova con Auth0 ID, prova con l'email
            data = await getUserByEmail(user.email);
          }
          if (data) {
            setUserData(data);
          } else {
            console.error('Utente non trovato');
          }
        } catch (error) {
          console.error('Errore nel recupero dei dati utente:', error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, isLoading, user]);

  const updateUserData = (newData) => {
    setUserData(newData);
  };

  return { userData, updateUserData };
}