// src/hooks/useUserData.js
import { useState, useEffect } from 'react';  // Importa gli hook di React necessari
import { useAuth0 } from "@auth0/auth0-react";  // Importa l'hook useAuth0 per l'autenticazione
import { getUserByEmail, getUserByAuth0Id } from '../Modules/ApiCrud';  // Importa le funzioni per recuperare i dati utente

export function useUserData() {
  // Stato per memorizzare i dati dell'utente
  const [userData, setUserData] = useState(null);
  // Ottiene lo stato di autenticazione e i dati dell'utente da Auth0
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    const fetchUserData = async () => {
      // Verifica se l'utente è autenticato e se i dati sono disponibili
      if (isAuthenticated && !isLoading && user) {
        try {
          let data;
          // Prova prima a recuperare l'utente usando l'Auth0 ID
          data = await getUserByAuth0Id(user.sub);
          if (!data && user.email) {
            // Se non trova con Auth0 ID, prova con l'email
            data = await getUserByEmail(user.email);
          }
          if (data) {
            // Se trova i dati, aggiorna lo stato
            setUserData(data);
          } else {
            console.error('Utente non trovato');
          }
        } catch (error) {
          console.error('Errore nel recupero dei dati utente:', error);
        }
      }
    };

    fetchUserData();  // Chiama la funzione per recuperare i dati
  }, [isAuthenticated, isLoading, user]);  // Dipendenze dell'effetto

  // Funzione per aggiornare manualmente i dati dell'utente
  const updateUserData = (newData) => {
    setUserData(newData);
  };

  // Restituisce i dati dell'utente e la funzione per aggiornarli
  return { userData, updateUserData };
}

/*
Questo hook personalizzato, useUserData, svolge un ruolo cruciale nell'applicazione per gestire
i dati dell'utente autenticato. Ecco le sue principali caratteristiche e utilizzi:

Scopo:

Recupera e mantiene i dati dell'utente dopo l'autenticazione con Auth0.
Fornisce un modo centralizzato per accedere e aggiornare i dati dell'utente in tutta l'applicazione.


Funzionamento:

Utilizza useAuth0 per verificare lo stato di autenticazione.
Quando l'utente è autenticato, tenta di recuperare i dati dell'utente dal backend,
prima usando l'Auth0 ID e poi, se necessario, l'email.
Memorizza i dati dell'utente in uno stato locale e fornisce una funzione per aggiornarli.


Utilizzo nei componenti:

App.jsx: Utilizzato per fornire i dati dell'utente a livello globale dell'applicazione.
Home.jsx: Per visualizzare informazioni personalizzate e gestire le transazioni dell'utente.
UserProfile.jsx: Per mostrare e permettere la modifica dei dati del profilo utente.
Groups.jsx: Per gestire l'appartenenza ai gruppi e gli inviti dell'utente.
 

Vantaggi:

Centralizza la logica di recupero e gestione dei dati utente.
Evita duplicazioni di codice nei vari componenti.
Fornisce un'interfaccia coerente per accedere ai dati dell'utente in tutta l'applicazione.


Importanza nel flusso dell'applicazione:

Garantisce che i dati dell'utente siano disponibili immediatamente dopo l'autenticazione.
Permette una gestione fluida dello stato dell'utente, essenziale per funzionalità come la personalizzazione
dell'interfaccia e la gestione delle autorizzazioni.

*/