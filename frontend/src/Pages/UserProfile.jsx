import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { updateUser, updateUserAvatar  } from "../Modules/ApiCrud";

export default function UserProfile({ userData, updateUserData }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (userData) {
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
  
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  if (!userData) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        // Se c'è un nuovo avatar, usa la funzione specifica per l'upload dell'avatar
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
          <form className='flex flex-col justify-center items-center gap-2' onSubmit={handleSubmit}>

            {/* Nome e Cognome */}
            <div className='flex flex-col sm:flex-row gap-2'>

              <div className='flex flex-col items-center'>
                <label>Nome</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </div>

              <div className='flex flex-col items-center'>
                <label>Cognome </label>
                <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} />
              </div>

            </div>
            
            {/* Email e data di nascita */}
            <div className='flex flex-col sm:flex-row items-center gap-4'>

              <div className='flex flex-col text-center'>
                <label>Email: </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              
              <div className='flex flex-col text-center'>
                <label>Data di nascita: </label>
                <input type="date" name="data_di_nascita" value={formData.data_di_nascita} onChange={handleChange} />
              </div>

            </div>

            {/* Avatar (img profilo) */}
            <div>
              <label>Avatar: </label>
              <input type="file" name="avatar" onChange={handleAvatarChange} accept="image/*" />
              {avatarPreview && (
                <img src={avatarPreview} alt="Avatar Preview" style={{width: '100px', height: '100px', marginTop: '10px'}} />
              )}
            </div>
            <button type="submit">Salva modifiche</button>
            <button type="button" onClick={() => setEditMode(false)}>Annulla</button>
          </form>
        ) : (
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