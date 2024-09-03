import React, { useState, useEffect } from 'react';  // Importa React e hook necessari
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";  // Importa componenti per il routing
import { useAuth0 } from "@auth0/auth0-react";  // Importa hook per Auth0
import { useUserData } from './Hooks/useUserData';  // Importa hook personalizzato per i dati utente
import Nav from "./Components/Nav";  // Importa componente di navigazione
import MyFooter from "./Components/MyFooter";  // Importa componente footer
import AuthWrapper from "./Components/AuthWrapper";  // Importa wrapper per l'autenticazione
import UserProfile from './Pages/UserProfile';  // Importa pagina profilo utente
import Home from './Pages/Home';  // Importa pagina home
import Register from './Pages/Register';  // Importa pagina di registrazione
import Login from './Pages/Login';  // Importa pagina di login
import Groups from './Pages/Groups';  // Importa pagina dei gruppi
import WaveBackground from './Components/WaveBackground';  // Importa componente per lo sfondo
import { NotificationProvider } from './Contexts/NotificationContext.jsx';  // Importa provider per le notifiche
import { Flowbite } from 'flowbite-react';  // Importa componente Flowbite

function App() {
  const { isLoading } = useAuth0();  // Ottiene lo stato di caricamento da Auth0
  const { userData, updateUserData } = useUserData();  // Ottiene dati utente e funzione di aggiornamento

  if (isLoading) {
    return <div>Loading...</div>;  // Mostra un loader durante il caricamento
  }

  return (
    // Wrapper Flowbite per lo stile
    <Flowbite>  
      <div className="relative min-h-screen">
        {/* Componente per lo sfondo animato */}
        <WaveBackground />  
        <div className="relative z-10">
          {/* Provider per le notifiche */}
          <NotificationProvider>  
            {/* Router per la navigazione */}
            <Router>  
              <Nav 
                userData={userData}   // Passa i dati utente alla barra di navigazione
              />
              {/* Contenitore principale */}
              <main className="px-2 sm:px-5 py-8"> 
                {/* Definizione delle rotte */}
                <Routes>   
                  <Route path="/login" element={<Login />} />
                  {/* Wrapper per le rotte autenticate */}
                  <Route element={<AuthWrapper />}>   
                    <Route path="/" element={<Home userData={userData} />} />
                    <Route path="home" element={<Home userData={userData} />} />
                    <Route path="profile" element={<UserProfile userData={userData} updateUserData={updateUserData} />} />
                    <Route path="/groups" element={<Groups userData={userData} />} />
                    <Route path="register" element={<Register userData={userData} updateUserData={updateUserData} />} />
                  </Route>
                  {/* Reindirizza rotte non trovate a home */}
                  <Route path="*" element={<Navigate to="/home" replace />} />  
                </Routes>
              </main>
              {/* componente footer */}
              <MyFooter />  
            </Router>
          </NotificationProvider>
        </div>
      </div>
    </Flowbite>
  );
}

export default App;  