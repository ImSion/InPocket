import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { updateUser } from "../Modules/ApiCrud";

export default function UserProfile({ userData, updateUserData }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
    avatar: ''
  });

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

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        data_di_nascita: formatDateForSubmission(formData.data_di_nascita)
      };
      const updatedUser = await updateUser(userData._id, dataToSubmit);
      console.log("Profilo aggiornato:", updatedUser);
      updateUserData(updatedUser);
      setEditMode(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
    }
  };

  return (
      <div className='min-h-screen pt-20'>
        <h1 className='text-center mb-3'>Profilo Utente</h1>
        {editMode ? (
          <form className='flex flex-col justify-center items-center gap-2' onSubmit={handleSubmit}>

            <div className='flex gap-2'>
              <div className='flex flex-col items-center'>
                <label>Nome</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
              </div>
              <div className='flex flex-col items-center'>
                <label>Cognome </label>
                <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} />
              </div>
            </div>

            <div className='flex flex-col items-center'>
              <label>Email: </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label>Data di nascita: </label>
              <input type="date" name="data_di_nascita" value={formData.data_di_nascita} onChange={handleChange} />
            </div>
            <div>
              <label>URL Avatar: </label>
              <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} />
            </div>
            <button type="submit">Salva modifiche</button>
            <button type="button" onClick={() => setEditMode(false)}>Annulla</button>
          </form>
        ) : (
          <div className='flex flex-col justify-center items-center gap-2'>
            <p>Nome: {formData.nome}</p>
            <p>Cognome: {formData.cognome}</p>
            <p>Email: {formData.email}</p>
            <p>Data di nascita: {formData.data_di_nascita}</p>
            <img src={formData.avatar} alt="Avatar" style={{width: '100px', height: '100px'}} />
            <button onClick={() => setEditMode(true)}>Modifica profilo</button>
          </div>
        )}
      </div>
  );
}