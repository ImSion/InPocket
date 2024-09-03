import React, { useState, useEffect } from 'react';  // Importa React e gli hooks necessari
import { useAuth0 } from "@auth0/auth0-react";  // Importa hook per Auth0
import { Button, Card, Modal, Dropdown } from 'flowbite-react';  // Importa componenti UI da Flowbite
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';  // Importa componenti per i grafici
import { getUserTransactions, createTransaction, updateTransaction, deleteTransaction, getUserByEmail, getUserByAuth0Id } from '../Modules/ApiCrud';  // Importa funzioni API
import Transactions from '../Components/Transactions'  // Importa componente Transactions
import '../Style/MainCSS.css'  // Importa stili CSS

// Definizione del componente Home che accetta userData come prop
export default function Home({ userData: propUserData }) {
  // Utilizza useAuth0 per ottenere informazioni sull'autenticazione dell'utente
  const { isAuthenticated, user } = useAuth0();
  
  // Stati per gestire i dati dell'utente, le transazioni e i modali
  const [userData, setUserData] = useState(propUserData);  // Stato per i dati utente
  const [transactions, setTransactions] = useState([]);  // Stato per le transazioni
  const [showModal, setShowModal] = useState(false);  // Stato per mostrare/nascondere il modale
  const [currentTransaction, setCurrentTransaction] = useState(null);  // Stato per la transazione corrente
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // Stato per il modale di eliminazione
  const [transactionToDelete, setTransactionToDelete] = useState(null);  // Stato per la transazione da eliminare
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);  // Stato per la transazione selezionata
  
  // Effetto per aggiornare userData quando propUserData cambia
  useEffect(() => {
    setUserData(propUserData);
  }, [propUserData]);

  // Effetto per recuperare i dati dell'utente quando l'autenticazione cambia
  useEffect(() => {
    if (isAuthenticated && user && !userData) {
      fetchUserData();
    }
  }, [isAuthenticated, user, userData]);

  // Effetto per recuperare le transazioni quando i dati dell'utente sono disponibili
  useEffect(() => {
    if (userData) {
      fetchTransactions();
    }
  }, [userData]);

  // Funzione per recuperare i dati dell'utente dal backend
  const fetchUserData = async () => {
    try {
      let data;
      if (user.sub) {
        // Prova prima con l'Auth0 ID
        data = await getUserByAuth0Id(user.sub);
      }
      if (!data && user.email) {
        // Se non trova con Auth0 ID, prova con l'email
        data = await getUserByEmail(user.email);
      }
      if (data) {
        setUserData(data);
      } else {
        console.error('Utente non trovato');
      }
    } catch (error) {
      console.error('Errore nel recupero dei dati utente:', error);
    }
  };

  // Funzione per recuperare le transazioni dell'utente dal backend
  const fetchTransactions = async () => {
    try {
      const response = await getUserTransactions(userData._id);
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
      const isInCurrentMonth = currentDate >= startOfMonth && currentDate <= endOfMonth;
  
      while (currentDate <= endOfMonth) {
        if (currentDate >= startOfMonth && (!isInCurrentMonth || currentDate > today)) {
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

  // Componente per la legenda personalizzata del grafico a torta
  const CustomPieLegend = ({ data, title }) => (
    <>
      {/* Versione mobile (dropdown) */}
      <div className="md:hidden mt-2">
        <Dropdown label={title} dismissOnClick={false}>
          <Dropdown.Item>
            <div className="flex flex-col items-start">
              {data.map((entry, index) => (
                <div key={`legend-item-${index}`} className="flex items-center mb-1">
                  <div 
                    className="w-2 h-2 mr-2" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className='text-sm dark:text-white'>{entry.name}: {entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>
  
      {/* Versione desktop (sempre visibile) */}
      <div className="hidden md:flex md:flex-col md:items-start sm:mt-4">
        {data.map((entry, index) => (
          <div key={`legend-item-${index}`} className="flex items-center mb-1">
            <div 
              className="w-2 h-2 mr-2" 
              style={{ backgroundColor: entry.fill }}
            ></div>
            <span className='text-sm dark:text-white'>{entry.name}: {entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  );

  // Componente per il grafico a torta delle spese
  const PieExpensesGraphic = ({ data }) => {
    const { 
      pieDataAnnuale, 
      pieDataMensile, 
      saldoAnnuale, 
      saldoMensile, 
    } = data;
    
    return (
      <div className="flex flex-col sm:justify-between md:flex-row w-full">
        {/* Legenda Annuale (sinistra) */}
        <div className="flex items-center justify-center ml-4">
          <CustomPieLegend data={pieDataAnnuale} title="Legenda Annuale" />
        </div>
  
        {/* Grafici (centro) */}
        <div className="flex flex-col items-center">
          {/* Grafico Annuale */}
          <div className="mb-8">
            <div className="relative w-[200px] h-[200px]">
              <PieChart width={190} height={200}>
                <Pie
                  data={pieDataAnnuale}
                  cx={95}
                  cy={100}
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieDataAnnuale.map((entry, index) => (
                    <Cell key={`cell-annual-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="absolute w-36 flex flex-col justify-center items-center top-[105px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="font-bold dark:text-white">Saldo Annuale</div>
                <div className={saldoAnnuale >= 0 ? "text-green-500" : "text-red-500"}>
                  €{saldoAnnuale.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
  
          {/* Grafico Mensile */}
          <div>
            <div className="relative w-[200px] h-[200px]">
              <PieChart width={190} height={200}>
                <Pie
                  data={pieDataMensile}
                  cx={95}
                  cy={100}
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieDataMensile.map((entry, index) => (
                    <Cell key={`cell-monthly-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="absolute w-36 flex flex-col justify-center items-center top-[105px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="font-bold dark:text-white">Saldo Mensile</div>
                <div className={saldoMensile >= 0 ? "text-green-500" : "text-red-500"}>
                  €{saldoMensile.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Legenda Mensile (destra) */}
        <div className='flex flex-col items-center justify-center mr-4'>
          <CustomPieLegend data={pieDataMensile} title="Legenda Mensile" />
        </div>
      </div>
    );
  };

  // Funzione per preparare i dati finanziari per i grafici a torta
  const pieFinancialData = () => {
    let totalEntrateAnnuali = 0;
    let totalUsciteAnnuali = 0;
    let totalEntrateMensili = 0;
    let totalUsciteMensili = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const usciteColors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', 
      '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ];
  
    const categoryColorMap = {};
  
    const data = transactions.reduce((acc, t) => {
      const transactionDate = new Date(t.data);
      const importo = parseFloat(t.importo);
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  
      if (t.tipo === 'entrata') {
        totalEntrateAnnuali += importo;
        if (isCurrentMonth) totalEntrateMensili += importo;
        if (!acc.entrate[t.categoria]) {
          acc.entrate[t.categoria] = { valueAnnuale: 0, valueMensile: 0, fill: '#4CAF50' };
          categoryColorMap[t.categoria] = '#4CAF50';
        }
        acc.entrate[t.categoria].valueAnnuale += importo;
        if (isCurrentMonth) acc.entrate[t.categoria].valueMensile += importo;
      } else {
        totalUsciteAnnuali += importo;
        if (isCurrentMonth) totalUsciteMensili += importo;
        if (!acc.uscite[t.categoria]) {
          const color = usciteColors[Object.keys(acc.uscite).length % usciteColors.length];
          acc.uscite[t.categoria] = { valueAnnuale: 0, valueMensile: 0, fill: color };
          categoryColorMap[t.categoria] = color;
        }
        acc.uscite[t.categoria].valueAnnuale += importo;
        if (isCurrentMonth) acc.uscite[t.categoria].valueMensile += importo;
      }
      return acc;
    }, { entrate: {}, uscite: {} });
  
    const pieDataAnnuale = [
      ...Object.entries(data.entrate).map(([name, { valueAnnuale, fill }]) => ({ name: `Entrata - ${name}`, value: valueAnnuale, fill })),
      ...Object.entries(data.uscite).map(([name, { valueAnnuale, fill }]) => ({ name: `Uscita - ${name}`, value: valueAnnuale, fill }))
    ];
  
    const pieDataMensile = [
      ...Object.entries(data.entrate)
        .filter(([_, { valueMensile }]) => valueMensile > 0)
        .map(([name, { valueMensile, fill }]) => ({ name: `Entrata - ${name}`, value: valueMensile, fill })),
      ...Object.entries(data.uscite)
        .filter(([_, { valueMensile }]) => valueMensile > 0)
        .map(([name, { valueMensile, fill }]) => ({ name: `Uscita - ${name}`, value: valueMensile, fill }))
    ];
  
    const saldoAnnuale = totalEntrateAnnuali - totalUsciteAnnuali;
    const saldoMensile = totalEntrateMensili - totalUsciteMensili;
  
    return { 
      pieDataAnnuale, 
      pieDataMensile, 
      saldoAnnuale, 
      saldoMensile, 
      totalEntrateAnnuali, 
      totalUsciteAnnuali,
      totalEntrateMensili,
      totalUsciteMensili,
      categoryColorMap
    };
  };

  // Funzione per preparare i dati per il grafico a linee
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

  const { categoryColorMap } = pieFinancialData();

  // Prepara i dati per il grafico a barre delle uscite per categoria
  const barChartData = Object.entries(transactions.reduce((acc, t) => {
    if (t.tipo === 'uscita') {
      acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.importo);
    }
    return acc;
  }, {})).map(([name, value]) => ({ 
    name, 
    value,
    fill: categoryColorMap[name] || '#000000'
  }));

  // Funzione per ottenere il numero di occorrenze annuali di una transazione ricorrente
  const getYearlyOccurrences = (transaction) => {
    switch (transaction.frequenzaRicorrenza) {
      case 'Giornaliera': return 365;
      case 'Settimanale': return 52;
      case 'Mensile': return 12;
      case 'Annuale': return 1;
      default: return 1;
    }
  };
    
  // Funzione per ottenere le top categorie di spesa
  const getTopExpenseCategories = () => {
    let totalAnnualExpenses = 0;
    const categoryExpenses = transactions.reduce((acc, t) => {
      if (t.tipo === 'uscita') {
        const importo = parseFloat(t.importo);
        if (!acc[t.categoria]) {
          acc[t.categoria] = {
            importo: 0,
            color: categoryColorMap[t.categoria] || '#000000'
          };
        }
        acc[t.categoria].importo += importo;
        totalAnnualExpenses += importo;
      }
      return acc;
    }, {});
  
    return {
      categories: Object.entries(categoryExpenses)
        .sort((a, b) => b[1].importo - a[1].importo)
        .slice(0, 5),
      totalAnnualExpenses
    };
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
  const handleDeleteTransaction = (id) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Funzione per confermare l'eliminazione di una transazione
  const confirmDeleteTransaction = async () => {
    try {
      await deleteTransaction(userData._id, transactionToDelete);
      fetchTransactions();
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Errore nell\'eliminazione della transazione:', error);
    }
  };

  // Rendering del componente
  return (
    <div className='xl:flex xl:flex-col xl:items-center'>
      {/* Header con benvenuto e titolo dashboard */}
      <div className='flex justify-between xl:w-[1000px]'>
        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 dark:text-white dark:shadow-lg textshdw shake">
          Bentornato, {userData?.nome || user.name}
        </h1>
        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 dark:text-white dark:shadow-lg shake">
          Dashboard
        </h1>
      </div>
      
      {/* Sezione dei grafici */}
      {/* Grafico a torta */}
      <div className='w-full xl:w-[1000px] fade-in flex flex-col items-center justify-center mb-4 border-2 rounded-lg dark:border-cyan-500 shadow-md dark:shadow-cyan-800 bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90'>
        <h2 className="text-xl font-semibold mb-2 mt-2 dark:text-white">Ripartizione Finanziaria</h2>
        <PieExpensesGraphic data={pieFinancialData()}/>
        {/* Riepilogo entrate e uscite */}
        <div className="mt-4 mb-2 flex justify-between w-full px-5 items-center text-center">
          {/* Entrate */}
          <div>
            <div>
              <span className="font-bold text-green-500">Entrate annuali: </span>
              <span className="dark:text-white">€{pieFinancialData().totalEntrateAnnuali?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="font-bold text-green-500">Entrate mensili: </span>
              <span className="dark:text-white">€{pieFinancialData().totalEntrateMensili?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          {/* Uscite */}
          <div>
            <div>
              <span className="font-bold text-red-500">Uscite annuali: </span>
              <span className="dark:text-white">€{pieFinancialData().totalUsciteAnnuali?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="font-bold text-red-500">Uscite mensili: </span>
              <span className="dark:text-white">€{pieFinancialData().totalUsciteMensili?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grafici a linee e a barre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Grafico Entrate/Uscite */}
        <div className='flex-col xl:w-[494px] dark:shadow-cyan-800 dark:border-cyan-500 fade-in-left h-full border-2 p-1 rounded-lg shadow-md justify-center items-center text-center bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90'>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Entrate/Uscite</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entrate" stroke="#3eff0d" name="Entrate" />
              <Line type="monotone" dataKey="uscite" stroke="#ff0d0d" name="Uscite" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Grafico Uscite per Categoria */}
        <div className='flex-col xl:w-[494px] dark:shadow-cyan-800 fade-in-right h-full border-2 dark:border-cyan-500 p-1 rounded-lg shadow-md justify-center items-center text-center bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90'>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Uscite per Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" className='text-[12px]' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar fill='' dataKey="value" name="Importo">
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Lista delle transazioni recenti */}
      <div className='flex relative dark:shadow-cyan-800 border-2 dark:border-cyan-500 flex-col xl:w-[1000px] justify-center p-1 rounded-lg shadow-md bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90'>
        {/* Pulsante per aggiungere una nuova transazione */}
        <div className="absolute top-3 left-3">
          <button onClick={() => handleOpenModal()} className='border-2 border-x-sky-600 border-y-emerald-600 rounded-lg'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-emerald-500 shdw-btn">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-6 mt-4 dark:text-white text-center">Transazioni Recenti</h2>
        <div className="sm:flex sm:gap-4 border-t-2 border-black dark:border-cyan-500">
          {/* Lista delle prime 10 transazioni */}
          <ul className="w-full sm:w-1/2 mt-3">
          {transactions.slice(0, 10).map((transaction) => (
            <li 
              key={transaction._id} 
              className={`flex justify-between items-center mb-3 dark:text-white px-2 cursor-pointer transition-colors duration-300 ${
                selectedTransactionId === transaction._id ? 'bg-slate-600 dark:bg-blue-900 h-10 rounded-lg px-5' : ''
              }`}
              onClick={() => setSelectedTransactionId(
                selectedTransactionId === transaction._id ? null : transaction._id
              )}
            >
            <div>
              <span>{transaction.descrizione} - {transaction.importo} €</span>
              <span className="ml-2 text-sm text-gray-500">
                {new Date(transaction.data).toLocaleDateString()}
              </span>
            </div>
            {selectedTransactionId === transaction._id && (
              <div className='flex gap-1 transition-opacity duration-300'>
                {/* Pulsante modifica */}
                <button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(transaction);
                  }} 
                  className="mr-2 w-8 h-7 flex items-center rounded-lg justify-center bg-transparent dark:bg-gray-800 border border-emerald-600 hover:bg-emerald-900 dark:hover:bg-green-900 shdw"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                {/* Pulsante elimina */}
                <button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTransaction(transaction._id);
                  }} 
                  className='w-8 h-7 flex rounded-lg shdw-red items-center justify-center bg-transparent dark:bg-gray-800 border border-red-600 hover:bg-red-900 dark:hover:bg-orange-950'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
              )}
            </li>
          ))}
          </ul>
          {/* Lista delle successive 10 transazioni (visibile solo su schermi più grandi) */}
          <ul className="w-full sm:w-1/2 hidden sm:block mt-3">
            {transactions.slice(10, 20).map((transaction) => (
              <li 
                key={transaction._id} 
                className={`flex justify-between items-center mb-3 dark:text-white px-2 cursor-pointer transition-colors duration-300 ${
                  selectedTransactionId === transaction._id ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                onClick={() => setSelectedTransactionId(
                  selectedTransactionId === transaction._id ? null : transaction._id
                )}
              >
                <div>
                  <span>{transaction.descrizione} - {transaction.importo} €</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(transaction.data).toLocaleDateString()}
                  </span>
                </div>
                {selectedTransactionId === transaction._id && (
                  <div className='flex gap-1 transition-opacity duration-300'>
                    {/* Pulsante modifica */}
                    <button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(transaction);
                      }} 
                      className="mr-2 w-8 h-7 flex items-center rounded-lg justify-center bg-transparent dark:bg-gray-800 border border-emerald-600 hover:bg-emerald-900 dark:hover:bg-green-900 shdw"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    {/* Pulsante elimina */}
                    <button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTransaction(transaction._id);
                      }} 
                      className='w-8 h-7 flex rounded-lg shdw-red items-center justify-center bg-transparent dark:bg-gray-800 border border-red-600 hover:bg-red-900 dark:hover:bg-orange-950'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top Categorie di Spesa */}
      <Card className="mt-4 dark:border-cyan-500 border-2 shadow-md dark:shadow-cyan-800 bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">In cosa spendi di più (Annuale)</h2>
        {(() => {
          const { categories, totalAnnualExpenses } = getTopExpenseCategories();
          if (categories.length === 0) {
            return <p>Nessuna spesa registrata.</p>;
          }
          const maxSpend = categories[0][1].importo; // Il valore più alto
          return (
            <>
              <p className="mb-2 dark:text-white">Spese totali annuali: {totalAnnualExpenses.toFixed(2)} €</p>
              <ul>
                {categories.map(([categoria, { importo, color }], index) => (
                  <li key={categoria} className="mb-3 dark:text-white">
                    <div className="flex justify-between items-center mb-1">
                      <span className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: color}}></div>
                        {index + 1}. {categoria}
                      </span>
                      <span className="font-semibold">{importo.toFixed(2)} €</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{
                          width: `${(importo / maxSpend) * 100}%`,
                          backgroundColor: color
                        }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          );
        })()}
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

      {/* Modale di conferma eliminazione */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header className='dark:bg-sky-950'>Conferma eliminazione</Modal.Header>
        <Modal.Body className='dark:bg-sky-950'>
          <p className='dark:text-white'>Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.</p>
        </Modal.Body>
        <Modal.Footer className='dark:bg-sky-950'>
          <Button color="failure" onClick={confirmDeleteTransaction}>
            Sì, elimina
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}