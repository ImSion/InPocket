import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card } from 'flowbite-react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUserTransactions, createTransaction, updateTransaction, deleteTransaction, getUserByEmail } from '../Modules/ApiCrud';
import Transactions from '../Components/Transactions'

export default function Home() {
  // Utilizziamo useAuth0 per ottenere informazioni sull'autenticazione dell'utente
  const { isAuthenticated, user } = useAuth0();
  
  // Stati per gestire i dati dell'utente, le transazioni e il modale
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Effetto per recuperare i dati dell'utente quando l'autenticazione cambia
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  // Effetto per recuperare le transazioni quando i dati dell'utente sono disponibili
  useEffect(() => {
    if (userData) {
      fetchTransactions();
    }
  }, [userData]);

  // Funzione per recuperare i dati dell'utente dal backend
  const fetchUserData = async () => {
    try {
      const data = await getUserByEmail(user.email);
      setUserData(data);
    } catch (error) {
      console.error('Errore nel recupero dei dati utente:', error);
    }
  };

  // Funzione per recuperare le transazioni dell'utente dal backend
  const fetchTransactions = async () => {
    try {
      console.log("Recupero transazioni per l'utente:", userData._id);
      const response = await getUserTransactions(userData._id);
      console.log("Transazioni recuperate:", response);
      const allTransactions = [...response.data, ...generateRecurringTransactions(response.data)];
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Errore nel recupero delle transazioni:', error);
    }
  };

  // Funzione per generare le transazioni ricorrenti
  const generateRecurringTransactions = (transactionsData) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
    return transactionsData.filter(t => t.ricorrenza).flatMap(t => {
      const generatedTransactions = [];
      let currentDate = new Date(t.data);
  
      // Controlla se la transazione originale è già nel mese corrente
      const isOriginalInCurrentMonth = currentDate >= startOfMonth && currentDate <= endOfMonth;
  
      while (currentDate <= endOfMonth) {
        if (currentDate >= startOfMonth && (!isOriginalInCurrentMonth || currentDate > today)) {
          generatedTransactions.push({
            ...t,
            data: new Date(currentDate),
            _id: `generated_${t._id}_${currentDate.toISOString()}`
          });
        }
  
        // Aggiorna la data per la prossima iterazione
        switch (t.frequenzaRicorrenza) {
          case 'Giornaliera':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'Settimanale':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'Mensile':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'Annuale':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
        }
      }
  
      return generatedTransactions;
    });
  };

  // Funzione per preparare i dati per il grafico
  const prepareChartData = () => {
    const data = {};
    transactions.forEach(t => {
      const date = new Date(t.data).toLocaleDateString();
      if (!data[date]) {
        data[date] = { date, entrate: 0, uscite: 0 };
      }
      if (t.tipo === 'entrata') {
        data[date].entrate += parseFloat(t.importo);
      } else {
        data[date].uscite += parseFloat(t.importo);
      }
    });
    return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Preparazione dei dati per il grafico
  const chartData = prepareChartData();

  // Funzione per aprire il modale delle transazioni
  const handleOpenModal = (transaction = null) => {
    setCurrentTransaction(transaction);
    setShowModal(true);
  };

  // Funzione per chiudere il modale delle transazioni
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTransaction(null);
  };

  // Funzione per gestire l'invio di una transazione (creazione o aggiornamento)
  const handleSubmitTransaction = async (transactionData) => {
    try {
      if (!userData) {
        console.error('Dati utente non disponibili');
        return;
      }
      if (currentTransaction) {
        await updateTransaction(userData._id, currentTransaction._id, transactionData);
      } else {
        await createTransaction(userData._id, transactionData);
      }
      fetchTransactions();
      handleCloseModal();
    } catch (error) {
      console.error('Errore nella gestione della transazione:', error);
    }
  };

  // Funzione per eliminare una transazione
  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(userData._id, id);
      fetchTransactions();
    } catch (error) {
      console.error('Errore nell\'eliminazione della transazione:', error);
    }
  };
  

  // Rendering del componente
  return (
    <div className="container mx-auto p-4 pt-20">
      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4">Bentornato, {user.name}</h1>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      </div>
      
      {/* Sezione dei grafici */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Grafico Entrate/Uscite */}
        <Card>
          <h2 className="text-xl font-semibold mb-2">Entrate/Uscite</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entrate" stroke="#8884d8" name="Entrate" />
              <Line type="monotone" dataKey="uscite" stroke="#82ca9d" name="Uscite" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Grafico Uscite per Categoria */}
        <Card>
          <h2 className="text-xl font-semibold mb-2">Uscite per Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(transactions.reduce((acc, t) => {
              if (t.tipo === 'uscita') {
                acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.importo);
              }
              return acc;
            }, {})).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Importo" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Pulsante per aggiungere una nuova transazione */}
      <div className="flex justify-center space-x-4 mb-4">
        <Button onClick={() => handleOpenModal()}>Aggiungi Transazione</Button>
      </div>
      
      {/* Lista delle transazioni recenti */}
      <Card>
        <h2 className="text-xl font-semibold mb-2">Transazioni Recenti</h2>
        <ul>
          {transactions.slice(0, 10).map((transaction) => (
            <li key={transaction._id} className="flex justify-between items-center mb-2">
              <span>{transaction.descrizione} - {transaction.importo} €</span>
              <div className='flex'>
                <Button size="sm" onClick={() => handleOpenModal(transaction)} className="mr-2">Modifica</Button>
                <Button size="sm" onClick={() => handleDeleteTransaction(transaction._id)}>Elimina</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Modale per aggiungere/modificare transazioni */}
      {userData && (
        <Transactions 
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTransaction}
          transaction={currentTransaction}
        />
      )}
    </div>
  );
}