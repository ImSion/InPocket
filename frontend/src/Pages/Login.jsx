import React from 'react';  // Importa React
import { useAuth0 } from "@auth0/auth0-react";  // Importa il hook useAuth0 per l'autenticazione
import { Button } from "flowbite-react";  // Importa il componente Button da Flowbite
import logo from '../assets/Logo.png';  // Importa l'immagine del logo
import '../Style/MainCSS.css';  // Importa gli stili CSS personalizzati

export default function Login() {
  // Estrae la funzione loginWithRedirect da useAuth0
  const { loginWithRedirect } = useAuth0();

  // Funzione per gestire il click sul pulsante di login
  const handleLogin = () => {
    loginWithRedirect();  // Avvia il processo di login con Auth0
  };

  return (
    // Container principale con flexbox, centrato verticalmente e orizzontalmente
    <div className="flex flex-col min-h-screen items-center justify-center dark:text-white">
      {/* Container per il logo con animazione fade-in */}
      <div className="mb-10 fade-in">   
        <img src={logo} className="h-48" alt="Logo InPocket" />
      </div>

      {/* Titolo con animazione typewriter e responsive design */}
      <h1 className="text-xl sm:text-3xl sm:w-[420px] mb-10 font-bold text-center typewriter">
        Benvenuto in InPocket
      </h1>

      {/* Container per il pulsante di login con bordo e animazione slide-in */}
      <div className="flex items-center space-x-4 mb-48 border-4 rounded-lg border-[#f7cc69] slide-in-left">
        {/* Pulsante di login utilizzando il componente Button di Flowbite */}
        <Button 
          size="lg"  // Dimensione grande del pulsante
          onClick={handleLogin}  // Funzione da eseguire al click
          className="bg-gradient-to-r from-[#3a5e68] to-[#0d447b] hover:from-blue-700 hover:to-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Effettua il Login o Registrati
        </Button>
      </div>
    </div>
  );
}