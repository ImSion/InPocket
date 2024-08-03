import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserByEmail, registerUser } from "../Modules/ApiCrud";

function AuthWrapper() {
  // Estrae le proprietà necessarie dal hook useAuth0
  const { isLoading, isAuthenticated, user, logout } = useAuth0();

  // Definisce gli stati locali per tracciare se il profilo è completo e i dati dell'utente
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [userData, setUserData] = useState(null);

  // Ottiene l'oggetto location e la funzione di navigazione da React Router
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAndRegisterUser() {
        // Verifica se l'utente è autenticato, se ci sono dati utente da Auth0 e se non abbiamo già i dati dell'utente
      if (isAuthenticated && user && !userData) {
        try {
            // Cerca l'utente nel database usando l'email
          const dbUser = await getUserByEmail(user.email);
          // Se l'utente non esiste nel database
          if (!dbUser) {
              // Registra un nuovo utente con i dati di Auth0
            const newUser = await registerUser({
              auth0Id: user.sub,
              email: user.email,
              nome: user.given_name || user.nickname || '',
              cognome: user.family_name || '',
              avatar: user.picture,
              provider: user.sub.split('|')[0],
              isProfileComplete: false
            });
            setIsProfileComplete(false);
            setUserData(newUser);
            // Imposta lo stato e reindirizza alla pagina di registrazione
            navigate("/register");
            // Se l'utente esiste nel database
          } else {
            setIsProfileComplete(dbUser.isProfileComplete === true);
            setUserData(dbUser);
            if (!dbUser.isProfileComplete) {
              navigate("/register");
            }
            // Imposta lo stato e reindirizza alla registrazione se il profilo non è completo
          }
        } catch (error) {
          console.error("Errore durante la verifica/registrazione dell'utente:", error);
          setIsProfileComplete(false);
        }
      }
    }

    // Esegue la funzione quando cambiano le dipendenze specificate
    checkAndRegisterUser();
  }, [isAuthenticated, user, userData, navigate]);
  
  const handleLogout = () => { // Funzione per gestire il logout
    logout({ returnTo: window.location.origin + '/login' });
  };
  

  if (isLoading) { // Mostra un loader mentre Auth0 sta caricando
    return <div>Loading...</div>;
  }
 

  if (!isAuthenticated) { // Reindirizza alla pagina di login se l'utente non è autenticato
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Reindirizza alla pagina di registrazione se il profilo non è completo
  if (isAuthenticated && userData && !userData.isProfileComplete && location.pathname !== "/register") {
    return <Navigate to="/register" replace />;
  }
  
  // Renderizza i componenti figli passando il contesto
  return <Outlet context={{ userData, setUserData, handleLogout }} />;
 
}

export default AuthWrapper;