import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { updateUser, registerUser, getUserByAuth0Id } from "../Modules/ApiCrud";

export default function Register({ updateUserData }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth0();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        let dbUser = await getUserByAuth0Id(user.sub);
        
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
        // Se l'utente non viene trovato, usiamo i dati di Auth0
        setFormData({
          nome: user.given_name || '',
          cognome: user.family_name || '',
          email: user.email || '',
          data_di_nascita: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        data_di_nascita: formData.data_di_nascita ? new Date(formData.data_di_nascita).toISOString() : null
      };
      let updatedUser;
      // Sempre tenta di registrare un nuovo utente
      updatedUser = await registerUser({
        ...dataToSubmit,
        auth0Id: user.sub,
        avatar: user.picture,
        provider: user.sub.split('|')[0],
        isProfileComplete: true
      });
      updateUserData(updatedUser);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Errore durante il completamento del profilo:", error);
      // Se l'utente esiste già, prova ad aggiornarlo
      if (error.response && error.response.status === 400) {
        try {
          updatedUser = await updateUser(user.sub, {
            ...dataToSubmit,
            isProfileComplete: true,
          });
          updateUserData(updatedUser);
          navigate("/home", { replace: true });
        } catch (updateError) {
          console.error("Errore durante l'aggiornamento del profilo:", updateError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form 
        className="w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl mb-6 text-center">Completa il tuo profilo</h1>

        <div className="mb-4">
          <input 
            name="nome" 
            type="text" 
            placeholder="Nome" 
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <input 
            name="cognome" 
            type="text" 
            placeholder="Cognome" 
            value={formData.cognome}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <input 
            name="data_di_nascita" 
            type="date" 
            value={formData.data_di_nascita}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button 
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Caricamento..." : "Completa profilo"}
        </button>
      </form>
    </div>
  );
}