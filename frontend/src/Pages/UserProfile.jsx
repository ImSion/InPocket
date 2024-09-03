import React, { useState, useEffect } from 'react';  // Importa React e gli hooks necessari
import { Navigate } from 'react-router-dom';  // Importa Navigate per il reindirizzamento
import { updateUser, updateUserAvatar  } from "../Modules/ApiCrud";  // Importa funzioni per l'aggiornamento dell'utente

export default function UserProfile({ userData, updateUserData }) {
  const [editMode, setEditMode] = useState(false);  // Stato per la modalità di modifica
  const [formData, setFormData] = useState({  // Stato per i dati del form
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);  // Stato per il file dell'avatar
  const [avatarPreview, setAvatarPreview] = useState(null);  // Stato per l'anteprima dell'avatar

  useEffect(() => {
    if (userData) {
      // Inizializza formData con i dati dell'utente quando disponibili
      setFormData({
        nome: userData.nome || '',
        cognome: userData.cognome || '',
        email: userData.email || '',
        data_di_nascita: userData.data_di_nascita 
          ? new Date(userData.data_di_nascita).toISOString().split('T')[0] 
          : '',
        avatar: userData.avatar || ''
      });
      setAvatarPreview(userData.avatar || '');
    }
  }, [userData]);
  
  // Formatta la data per l'invio
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  // Reindirizza al login se non ci sono dati utente
  if (!userData) {
    return <Navigate to="/login" />;
  }

  // Gestisce il cambiamento nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestisce il cambiamento dell'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gestisce l'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('nome', formData.nome);
      formDataToSubmit.append('cognome', formData.cognome);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('data_di_nascita', formatDateForSubmission(formData.data_di_nascita));

      let updatedUser;

      if (avatarFile) {
        // Carica il nuovo avatar se presente
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        const avatarResponse = await updateUserAvatar(userData._id, avatarFormData);
        updatedUser = avatarResponse.data;
      }

      // Aggiorna gli altri dati dell'utente
      updatedUser = await updateUser(userData._id, formDataToSubmit);

      console.log("Profilo aggiornato:", updatedUser);
      updateUserData(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
    }
  };

  return (
      <div className='min-h-screen pt-20'>
        <h1 className='text-center mb-3 dark:text-white'>Profilo Utente</h1>
        {editMode ? (
          // Form di modifica
          <form className='flex flex-col justify-center items-center gap-2' onSubmit={handleSubmit}>
            {/* ... Campi del form ... */}
          </form>
        ) : (
          // Visualizzazione dei dati del profilo
          <div className='flex flex-col justify-center items-center gap-2 dark:text-white'>
            <img src={formData.avatar} alt="Avatar" className='w-[99%] h-72 sm:w-80' />
            <div className='flex gap-4'>
              <p>Nome: {formData.nome}</p>
              <p>Cognome: {formData.cognome}</p>
            </div>
            <p>Email: {formData.email}</p>
            <p>Data di nascita: {formData.data_di_nascita}</p>
            <button onClick={() => setEditMode(true)}>Modifica profilo</button>
          </div>
        )}
      </div>
  );
}