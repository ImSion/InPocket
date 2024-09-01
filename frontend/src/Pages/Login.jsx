import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "flowbite-react";
import logo from '../assets/Logo.png';
import '../Style/MainCSS.css'; 

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center dark:text-white">
      <div className="mb-10 fade-in">   
        <img src={logo} className="h-48" alt="Logo InPocket" />
      </div>

      <h1 className="text-xl sm:text-3xl sm:w-[420px] mb-10 font-bold text-center typewriter">
        Benvenuto in InPocket
      </h1>

      <div className="flex items-center space-x-4 mb-48 border-4 rounded-lg border-[#f7cc69] slide-in-left">
        <Button 
          size="lg" 
          onClick={handleLogin} 
          className="bg-gradient-to-r from-[#3a5e68] to-[#0d447b] hover:from-blue-700 hover:to-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Effettua il Login o Registrati
        </Button>
      </div>
    </div>
  );
}