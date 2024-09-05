import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "flowbite-react";
import logo from '../assets/Logo.png';
import '../Style/MainCSS.css'; 

export default function Login() {
  const { loginWithRedirect } = useAuth0();
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 4500); // Mostra l'intro per 3 secondi

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 4000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <>
      {showIntro && (
        <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-black flex flex-col items-center justify-center z-50 fade-out-left">
          <img src={logo} className="h-96 fade-in" alt="Logo InPocket" />
          <h1 className={`text-xl mt-10 dark:text-white sm:text-3xl sm:w-[420px] mb-10 font-bold text-center typewriter 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          Benvenuti in InPocket
          </h1>
        </div>
      )}

      <div className="flex flex-col min-h-screen items-center justify-center dark:text-white relative">
        <div className={`mb-10 fade-in ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>   
          <img src={logo} className="h-48 sm:h-72" alt="Logo InPocket" />
        </div>

        

        <div className={`flex items-center space-x-4 mb-48 mt-10 border-4 rounded-lg border-[#f7cc69] slide-in-left ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          <Button 
            size="lg" 
            onClick={handleLogin} 
            className="bg-gradient-to-r sm:w-96 from-[#3a5e68] to-[#0d447b] hover:from-blue-700 hover:to-green-600 text-white font-bold py-2 px-4 rounded"
          >
            <h1 className='text-sm sm:text-xl'>Effettua il Login o Registrati</h1>
          </Button>
        </div>
      </div>
    </>
  );
}