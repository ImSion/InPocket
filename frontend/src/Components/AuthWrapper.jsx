import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { getUserByAuth0Id, getUserByEmail } from "../Modules/ApiCrud";

function AuthWrapper() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          let dbUser = await getUserByAuth0Id(user.sub);
          if (!dbUser && user.email) {
            dbUser = await getUserByEmail(user.email);
          }
          
          if (dbUser) {
            const isComplete = dbUser.isProfileComplete && dbUser.nome && dbUser.cognome && dbUser.email && dbUser.data_di_nascita;
            setIsProfileComplete(isComplete);
            if (!isComplete && location.pathname !== '/register') {
              navigate('/register', { replace: true });
            }
          } else {
            setIsProfileComplete(false);
            if (location.pathname !== '/register') {
              navigate('/register', { replace: true });
            }
          }
        } catch (error) {
          console.error("Errore nel controllo del profilo utente:", error);
        }
      }
    };
  
    checkUserProfile();
  }, [isAuthenticated, user, location.pathname, navigate]);

  if (isLoading || isProfileComplete === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isProfileComplete && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
}

export default AuthWrapper;