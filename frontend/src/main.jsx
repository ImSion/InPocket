import React from 'react'  // Importa React, necessario per JSX
import ReactDOM from 'react-dom/client'  // Importa ReactDOM per il rendering
import App from './App.jsx'  // Importa il componente principale App
import './index.css'  // Importa lo stile CSS globale
import { Auth0Provider } from '@auth0/auth0-react';  // Importa Auth0Provider per l'autenticazione

// Ottiene le variabili d'ambiente per Auth0
const domain = import.meta.env.VITE_AUTH0_DOMAIN // Domain di Auth0
const clientId = import.meta.env.MODE === 'development' 
  ? import.meta.env.VITE_AUTH0_CLIENT_ID_SV
  : import.meta.env.VITE_AUTH0_CLIENT_ID;

const callbackUrl = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5173'
  : 'https://in-pocket.vercel.app/login';

// Crea e renderizza l'applicazione React
ReactDOM.createRoot(document.getElementById('root')).render(
  // Attiva controlli aggiuntivi e avvertimenti in modalità sviluppo
  <React.StrictMode>  
    <Auth0Provider
      domain={domain}  // Configura il domain di Auth0
      clientId={clientId}  // Configura il client ID di Auth0
      authorizationParams={{
        redirect_uri: callbackUrl
      }}
      useRefreshTokens={true}  // Abilita l'uso dei token di refresh
      cacheLocation="localstorage"  // Memorizza i token nel localStorage
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)