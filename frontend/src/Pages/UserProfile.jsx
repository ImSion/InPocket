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
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        const avatarResponse = await updateUserAvatar(userData._id, avatarFormData);
        updatedUser = avatarResponse.data;
      }

      updatedUser = await updateUser(userData._id, formDataToSubmit);

      console.log("Profilo aggiornato:", updatedUser);
      updateUserData(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
    }
  };

  return (
      <div className='min-h-screen pt-20 '>
        <div className='p-3 py-10 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-black dark:bg-opacity-80 dark:shadow-[inset_0px_0px_20px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_25px] dark:hover:shadow-sky-500'>
          <h1 className='text-center mb-3 dark:text-white'>Profilo Utente</h1>
          {editMode ? (
            <form className='flex flex-col justify-center items-center gap-2' onSubmit={handleSubmit}>

              {/* Avatar/img profilo */}
              <div className='p-5 flex flex-col items-center justify-center mt-5 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500'>             
                  <label className='text-xl'>Avatar: </label>
                  <input type="file" name="avatar" onChange={handleAvatarChange} accept="image/*" />             
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar Preview" className='w-[350px]' />
                )}
              </div>

              {/* nome e cognome */}
              <div className='flex flex-col sm:flex-row gap-2'>
                <div className='flex flex-col items-center'>
                  <label>Nome</label>
                  <input className='p-3 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500'
                   type="text" name="nome" value={formData.nome} onChange={handleChange}
                    />
                </div>
                <div className='flex flex-col items-center'>
                  <label>Cognome </label>
                  <input className='p-3 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500'
                   type="text" name="cognome" value={formData.cognome} onChange={handleChange}
                    />
                </div>
              </div>

              {/* data di nascita ed email */}
              <div className='flex flex-col sm:flex-row items-center gap-4'>
                <div className='flex flex-col text-center'>
                  <label>Email: </label>
                  <input className='p-3 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500'
                  type="email" name="email" value={formData.email} onChange={handleChange}
                   />
                </div>
                <div className='flex flex-col text-center'>
                  <label>Data di nascita: </label>
                  <input className='p-3 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500' 
                  type="date" name="data_di_nascita" value={formData.data_di_nascita} onChange={handleChange} 
                  />
                </div>
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
      </div>
  );
}