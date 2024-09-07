import React, { useState, useEffect } from 'react';  // Importa React e gli hooks necessari
import { useNavigate } from 'react-router-dom';  // Importa useNavigate per la navigazione programmatica
import { useAuth0 } from "@auth0/auth0-react";  // Importa hook per Auth0
import { updateUser, registerUser, getUserByAuth0Id } from "../Modules/ApiCrud";  // Importa funzioni API

export default function Register({ updateUserData }) {
  // Stato per i dati del form
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
  });
  const [isLoading, setIsLoading] = useState(true);  // Stato per gestire il caricamento
  const navigate = useNavigate();  // Hook per la navigazione
  const { user } = useAuth0();  // Ottiene i dati dell'utente da Auth0

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);  // Inizia il caricamento
      try {
        // Tenta di ottenere i dati dell'utente dal database
        let dbUser = await getUserByAuth0Id(user.sub);
        
        // Imposta i dati del form, usando i dati del DB se disponibili, altrimenti usa quelli di Auth0
        setFormData({
          nome: dbUser?.nome || user.given_name || '',
          cognome: dbUser?.cognome || user.family_name || '',
          email: dbUser?.email || user.email || '',
          data_di_nascita: dbUser?.data_di_nascita 
            ? new Date(dbUser.data_di_nascita).toISOString().split('T')[0] 
            : '',
        });
      } catch (error) {
        console.error("Errore nel recupero dei dati utente:", error);
        // Se l'utente non viene trovato, usa i dati di Auth0
        setFormData({
          nome: user.given_name || '',
          cognome: user.family_name || '',
          email: user.email || '',
          data_di_nascita: '',
        });
      } finally {
        setIsLoading(false);  // Termina il caricamento
      }
    };

    if (user) {
      fetchUserData();  // Chiama la funzione se l'utente è disponibile
    }
  }, [user]);  // Esegue l'effetto quando l'utente cambia

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestisce l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Inizia il caricamento
    try {
      // Prepara i dati da inviare
      const dataToSubmit = {
        ...formData,
        data_di_nascita: formData.data_di_nascita ? new Date(formData.data_di_nascita).toISOString() : null
      };
      let updatedUser;
      // Tenta di registrare un nuovo utente
      updatedUser = await registerUser({
        ...dataToSubmit,
        auth0Id: user.sub,
        avatar: user.picture,
        provider: user.sub.split('|')[0],
        isProfileComplete: true
      });
      updateUserData(updatedUser);  // Aggiorna i dati utente nello stato globale
      navigate("/home", { replace: true });  // Naviga alla home
    } catch (error) {
      console.error("Errore durante il completamento del profilo:", error);
      // Se l'utente esiste già, prova ad aggiornarlo
      if (error.response && error.response.status === 400) {
        try {
          updatedUser = await updateUser(user.sub, {
            ...dataToSubmit,
            isProfileComplete: true,
          });
          updateUserData(updatedUser);  // Aggiorna i dati utente nello stato globale
          navigate("/home", { replace: true });  // Naviga alla home
        } catch (updateError) {
          console.error("Errore durante l'aggiornamento del profilo:", updateError);
        }
      }
    } finally {
      setIsLoading(false);  // Termina il caricamento
    }
  };

  // Mostra un loader durante il caricamento
  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  // Rendering del form
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form 
        className="w-full fade-in max-w-md border border-sky-500 p-3 py-8 shadow-[inset_0px_0px_15px] shadow-sky-500 rounded-xl"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl mb-6 text-center dark:text-white">Completa il tuo profilo</h1>

        {/* Campo Nome */}
        <div className="mb-4">
          <input 
            name="nome" 
            type="text" 
            placeholder="Nome" 
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded fade-in-top"
          />
        </div>

        {/* Campo Cognome */}
        <div className="mb-4">
          <input 
            name="cognome" 
            type="text" 
            placeholder="Cognome" 
            value={formData.cognome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded fade-in-top delay-1"
          />
        </div>

        {/* Campo Email */}
        <div className="mb-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded fade-in-top delay-2"
          />
        </div>

        {/* Campo Data di Nascita */}
        <div className="mb-6">
          <input 
            name="data_di_nascita" 
            type="date" 
            value={formData.data_di_nascita}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded fade-in-top delay-3"
          />
        </div>

        {/* Pulsante di invio */}
        <button 
          type="submit"
          className="w-full p-2 bg-sky-500 text-white rounded hover:bg-sky-600 fade-in-bottom"
          disabled={isLoading}
        >
          {isLoading ? "Caricamento..." : "Completa profilo"}
        </button>
      </form>
    </div>
  );
}