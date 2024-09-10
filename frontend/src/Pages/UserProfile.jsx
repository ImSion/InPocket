import React, { useState, useEffect } from 'react';  // Importa React e gli hooks necessari
import { Navigate } from 'react-router-dom';  // Importa Navigate per la redirezione
import { updateUser, updateUserAvatar, getUserTransactions } from "../Modules/ApiCrud";  // Importa le funzioni API necessarie

// Definizione del componente UserProfile
export default function UserProfile({ userData, updateUserData }) {
  // Stato per la modalità di modifica
  const [editMode, setEditMode] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  
  // Stato per i dati del form
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    data_di_nascita: '',
    avatar: ''
  });
  
  // Stato per il file dell'avatar
  const [avatarFile, setAvatarFile] = useState(null);
  
  // Stato per l'anteprima dell'avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Nuovo stato per i suggerimenti finanziari
  const [financialTips, setFinancialTips] = useState([]);

  // Effetto per inizializzare i dati del form quando userData cambia
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

  // Effetto per generare suggerimenti finanziari quando userData cambia
  useEffect(() => {
    if (userData) {
      generateFinancialTips();
    }
  }, [userData]); 

  // Funzione per formattare la data per l'invio
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  // Reindirizza al login se non ci sono dati utente
  if (!userData) {
    return <Navigate to="/login" />;
  }

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTips = () => {
    setIsTipsOpen(!isTipsOpen);
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

  // Nuova funzione per generare suggerimenti finanziari
  const generateFinancialTips = async () => {
    try {
      console.log("Generating financial tips...");
  
      const response = await getUserTransactions(userData._id);
      console.log("Transactions response:", response);
  
      // Estrai correttamente i dati dalla risposta
      const transactions = response.data && Array.isArray(response.data) ? response.data : [];
      console.log("Transactions fetched:", transactions.length);
  
      if (transactions.length === 0) {
        setFinancialTips(["Non ci sono transazioni sufficienti per generare suggerimenti. Inizia ad aggiungere le tue transazioni per ricevere consigli personalizzati."]);
        return;
      }
  
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
  
      // Filtra le transazioni per il mese corrente
      let currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.data);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });
  
      // Filtra le transazioni per il mese precedente
      let lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.data);
        return transactionDate.getMonth() === (currentMonth - 1 + 12) % 12 && 
               (currentMonth === 0 ? transactionDate.getFullYear() === currentYear - 1 : transactionDate.getFullYear() === currentYear);
      });
  
      // Se non ci sono transazioni recenti, considera tutte le transazioni
      if (currentMonthTransactions.length === 0 && lastMonthTransactions.length === 0) {
        console.log("No recent transactions, using all transactions");
        currentMonthTransactions = transactions.slice(-10);  // Ultime 10 transazioni
        lastMonthTransactions = transactions.slice(-20, -10);  // 10 transazioni precedenti
      }
  
      console.log("Current month transactions:", currentMonthTransactions.length);
      console.log("Last month transactions:", lastMonthTransactions.length);
  
      const currentMonthSpending = currentMonthTransactions.reduce((sum, t) => t.tipo === 'uscita' ? sum + parseFloat(t.importo) : sum, 0);
      const lastMonthSpending = lastMonthTransactions.reduce((sum, t) => t.tipo === 'uscita' ? sum + parseFloat(t.importo) : sum, 0);
  
      console.log("Current month spending:", currentMonthSpending);
      console.log("Last month spending:", lastMonthSpending);
  
      const spendingDifference = lastMonthSpending !== 0 ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0;
  
      console.log("Spending difference:", spendingDifference);
  
      const tips = [];
  
      if (spendingDifference > 10) {
        tips.push(`Hai speso il ${spendingDifference.toFixed(0)}% in più questo mese rispetto al precedente. Ecco alcuni consigli per risparmiare: considera di creare un budget mensile e traccia le tue spese quotidiane.`);
      } else if (spendingDifference < -10) {
        tips.push(`Ottimo lavoro! Hai risparmiato il ${Math.abs(spendingDifference).toFixed(0)}% rispetto al mese scorso. Continua così!`);
      } else {
        tips.push("Le tue spese sono rimaste stabili nell'ultimo mese. Continua a monitorare le tue finanze per raggiungere i tuoi obiettivi.");
      }
  
      // Analisi delle categorie di spesa
      const categorySpending = currentMonthTransactions.reduce((acc, t) => {
        if (t.tipo === 'uscita') {
          acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.importo);
        }
        return acc;
      }, {});
  
      console.log("Category spending:", categorySpending);
  
      const topSpendingCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
      if (topSpendingCategory) {
        tips.push(`La tua categoria di spesa più alta questo mese è "${topSpendingCategory[0]}" con ${topSpendingCategory[1].toFixed(2)}€. Prova a ridurre del 10% per raggiungere i tuoi obiettivi di risparmio.`);
      }
  
      // Aggiungi un suggerimento generico se non ci sono abbastanza dati
      if (tips.length === 0) {
        tips.push("Continua a registrare le tue transazioni per ricevere suggerimenti finanziari personalizzati.");
      }
  
      console.log("Generated tips:", tips);
      setFinancialTips(tips);
    } catch (error) {
      console.error('Errore nel generare i suggerimenti finanziari:', error);
      setFinancialTips(["Non è stato possibile generare suggerimenti al momento. Riprova più tardi."]);
    }
  };

  // Rendering del componente
  return (
      <div className='min-h-screen pt-20 '>
        <div className='p-3 py-10 rounded-lg bg-white bg-opacity-85 dark:text-white dark:border-sky-500 dark:bg-black dark:bg-opacity-80 dark:shadow-[inset_0px_0px_20px] dark:shadow-sky-500 transition-all ease-in-out duration-500 dark:hover:shadow-[inset_0px_0px_25px] dark:hover:shadow-sky-500'>
          <h1 className='text-center sm:text-2xl font-bold mb-3 dark:text-white'>Profilo Utente</h1>
          {editMode ? (
            <form className='flex flex-col justify-center items-center gap-2' onSubmit={handleSubmit}>

              {/* Avatar/img profilo */}
              <div className='md:p-5 py-3 flex flex-col items-center justify-center mt-5 rounded-lg bg-transparent dark:text-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500'>             
                  <label className='text-xl mb-3'>Avatar: </label>
                  <input className='mb-3' type="file" name="avatar" onChange={handleAvatarChange} accept="image/*" />             
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar Preview" className='w-[90%] md:w-[400px] md:h-[400px] object-cover object-center' />
                )}
              </div>

              {/* nome e cognome */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex flex-col items-center'>
                  <label>Nome</label>
                  <input className='p-3 rounded-lg bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105'
                   type="text" name="nome" value={formData.nome} onChange={handleChange}
                    />
                </div>
                <div className='flex flex-col items-center'>
                  <label>Cognome </label>
                  <input className='p-3 rounded-lg bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105'
                   type="text" name="cognome" value={formData.cognome} onChange={handleChange}
                    />
                </div>
              </div>

              {/* data di nascita ed email */}
              <div className='flex flex-col sm:flex-row items-center gap-4'>
                <div className='flex flex-col text-center'>
                  <label>Email: </label>
                  <input className='p-3 rounded-lg bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105'
                  type="email" name="email" value={formData.email} onChange={handleChange}
                   />
                </div>
                <div className='flex flex-col text-center'>
                  <label>Data di nascita: </label>
                  <input className='p-3 rounded-lg w-52 bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105' 
                  type="date" name="data_di_nascita" value={formData.data_di_nascita} onChange={handleChange} 
                  />
                </div>
              </div>

              <div className='flex items-center justify-center gap-2 mt-4'>
                <button className='border border-emerald-500 p-3 rounded-lg shadow-[inset_0px_0px_10px] shadow-emerald-500 hover:shadow-[inset_0px_0px_16px] hover:shadow-emerald-500 transition-all ease-in-out duration-500 hover:scale-105' type="submit">Salva modifiche</button>
                <button className='border border-red-500 p-3 w-[138px] rounded-lg shadow-[inset_0px_0px_10px] shadow-red-500 hover:shadow-[inset_0px_0px_16px] hover:shadow-red-500 transition-all ease-in-out duration-500 hover:scale-105' type="button" onClick={() => setEditMode(false)}>Annulla</button>
              </div>

            </form>
          ) : (
            <div className='flex flex-col justify-center items-center gap-2 dark:text-white'>
              <div className='flex flex-col lg:flex-row gap-1 items-center justify-center '>

                <img src={formData.avatar} alt="Avatar" className='w-[99%] h-[400px] object-cover object-center sm:max-w-[600px] rounded-lg' />
  
                <div className='flex flex-col mt-2'>
                  
                  <p className='text-lg shadow-[inset_0px_0px_10px] font-sans border-black rounded-lg fade-in-top border mb-2 p-3'>Nome: {formData.nome}</p>
                  <p className='text-lg shadow-[inset_0px_0px_10px] font-sans border-black rounded-lg fade-in-top delay-1 border mb-2 p-3'>Cognome: {formData.cognome}</p>
    
                  <p className='text-lg w-80 shadow-[inset_0px_0px_10px] font-sans border-black rounded-lg fade-in-top delay-2 border mb-2 p-3'>Email: {formData.email}</p>
                  <p className='text-lg shadow-[inset_0px_0px_10px] font-sans border-black rounded-lg fade-in-top delay-3 border mb-2 p-3'>Data di nascita: {formData.data_di_nascita}</p>
  
                </div>

              </div>
                <button className='border border-sky-500 p-3 mt-3 rounded-lg shadow-[inset_0px_0px_10px] shadow-sky-500 hover:shadow-[inset_0px_0px_16px] hover:shadow-sky-500 transition-all ease-in-out duration-500' onClick={() => setEditMode(true)}>Modifica profilo</button>


            </div>
          )}
          
        </div>

      <div className='flex flex-col items-center'>
        <button 
          onClick={toggleTips}
          className="w-[260px] sm:w-[340px] mt-2 mb-2 p-1 bg-white bg-opacity-85 dark:bg-black dark:bg-opacity-80 rounded-lg dark:text-white dark:border-sky-500 dark:shadow-[inset_0px_0px_20px] dark:shadow-sky-500 transition-all ease-in-out duration-500 dark:hover:shadow-[inset_0px_0px_25px] dark:hover:shadow-sky-500">
          {isTipsOpen ? 'Chiudi suggerimenti' : 'Apri suggerimenti'}
        </button>    

        {/* Nuova sezione per i suggerimenti finanziari */}
        <div 
          className={`w-[340px] sm:w-full overflow-hidden transition-all duration-500 ease-in-out ${
            isTipsOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className='mt-8 p-4 bg-white bg-opacity-85 dark:bg-black dark:bg-opacity-80 rounded-lg dark:text-white dark:border-sky-500 dark:shadow-[inset_0px_0px_20px] dark:shadow-sky-500 transition-all ease-in-out duration-500 dark:hover:shadow-[inset_0px_0px_25px] dark:hover:shadow-sky-500'>
            <h2 className='text-xl font-bold mb-4 dark:text-white'>Suggerimenti Finanziari</h2>
            {financialTips.length > 0 ? (
              <ul className='list-disc pl-5'>
                {financialTips.map((tip, index) => (
                  <li key={index} className='mb-2 dark:text-white'>{tip}</li>
                ))}
              </ul>
            ) : (
              <p className='dark:text-white'>Nessun suggerimento disponibile al momento.</p>
            )}
          </div>
        </div>
      </div>  
    </div>
  );
}