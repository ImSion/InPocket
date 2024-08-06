import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { getUserByEmail, getUserByAuth0Id, createUser, updateUser } from "../Modules/ApiCrud";

function AuthWrapper() {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      checkAndRegisterUser();
    }
  }, [isAuthenticated, user]);

  const checkAndRegisterUser = async () => {
    try {
      let dbUser = await getUserByAuth0Id(user.sub);
      if (!dbUser && user.email) {
        dbUser = await getUserByEmail(user.email);
      }
      
      if (dbUser) {
        console.log("Utente trovato nel database:", dbUser);
        console.log("isProfileComplete:", dbUser.isProfileComplete);
        setIsProfileComplete(dbUser.isProfileComplete);
        setUserData(dbUser);
      } else {
        console.log("Utente non trovato, creazione nuovo utente");
        const newUser = await createUser({
          auth0Id: user.sub,
          email: user.email,
          nome: user.given_name || '',
          cognome: user.family_name || '',
          avatar: user.picture,
          provider: user.sub.split('|')[0],
          isProfileComplete: false
        });
        setUserData(newUser);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error("Errore durante la verifica/registrazione dell'utente:", error);
    }
  };

  const updateUserData = async (newData) => {
    try {
      const updatedUser = await updateUser(newData._id, { ...newData, isProfileComplete: true });
      setUserData(updatedUser);
      setIsProfileComplete(true);
    } catch (error) {
      console.error("Errore nell'aggiornamento dei dati utente:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && isProfileComplete === false && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  return <Outlet context={{ userData, updateUserData }} />;
}

export default AuthWrapper;