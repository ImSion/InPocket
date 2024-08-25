import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card } from 'flowbite-react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import { getUserTransactions, createTransaction, updateTransaction, deleteTransaction, getUserByEmail, getUserByAuth0Id } from '../Modules/ApiCrud';import Transactions from '../Components/Transactions'

// Modifichiamo la firma della funzione per accettare userData come prop
export default function Home({ userData: propUserData }) {
  // Utilizziamo useAuth0 per ottenere informazioni sull'autenticazione dell'utente
  const { isAuthenticated, user } = useAuth0();
  
  // Stati per gestire i dati dell'utente, le transazioni e il modale
  // Inizializziamo userData con propUserData
  const [userData, setUserData] = useState(propUserData);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  

  // Effetto per aggiornare userData quando propUserData cambia
  useEffect(() => {
    setUserData(propUserData);
  }, [propUserData]);

  // Effetto per recuperare i dati dell'utente quando l'autenticazione cambia
  // Manteniamo questo effetto come fallback nel caso in cui propUserData non sia disponibile
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
  // Manteniamo questa funzione come fallback
  const fetchUserData = async () => {
    try {
      let data;
      if (user.sub) {
        // Prova prima con l'Auth0 ID
        data = await getUserByAuth0Id(user.sub);
      }
      if (!data && user.email) {
        // Se non trova con Auth0 ID e l'email è disponibile, prova con l'email
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

  const CustomPieLegend = ({ data }) => (
    <div className="flex flex-col items-start mt-4">
      {data.map((entry, index) => (
        <div key={`legend-item-${index}`} className="flex items-center mb-1">
          <div 
            className="w-2 h-2 mr-2" 
            style={{ backgroundColor: entry.fill }}
          ></div>
          <span className='text-sm'>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  );

  const PieExpensesGraphic = ({ data }) => {
    const { pieData, saldo, totalEntrate, totalUscite } = data;
    
    return (
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="relative w-[300px] h-[200px]">
          <PieChart width={300} height={200}>
            <Pie
              data={pieData}
              cx={145}
              cy={100}
              innerRadius={65}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          
          <div className="absolute top-[105px] right-[92px] transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="font-bold">Saldo</div>
            <div className={saldo >= 0 ? "text-green-500" : "text-red-500"}>
              €{saldo.toFixed(2)}
            </div>
          </div>
        </div>
        
        <CustomPieLegend data={pieData} />
      </div>
    );
  };

  const pieFinancialData = () => {
    let totalEntrate = 0;
    let totalUscite = 0;
    const usciteColors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', 
      '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ];
  
    const categoryColorMap = {};
  
    const data = transactions.reduce((acc, t) => {
      const importo = parseFloat(t.importo);
      if (t.tipo === 'entrata') {
        totalEntrate += importo;
        if (!acc.entrate[t.categoria]) {
          acc.entrate[t.categoria] = { value: 0, fill: '#4CAF50' };
          categoryColorMap[t.categoria] = '#4CAF50';
        }
        acc.entrate[t.categoria].value += importo;
      } else {
        totalUscite += importo;
        if (!acc.uscite[t.categoria]) {
          const color = usciteColors[Object.keys(acc.uscite).length % usciteColors.length];
          acc.uscite[t.categoria] = { value: 0, fill: color };
          categoryColorMap[t.categoria] = color;
        }
        acc.uscite[t.categoria].value += importo;
      }
      return acc;
    }, { entrate: {}, uscite: {} });
  
    const pieData = [
      ...Object.entries(data.entrate).map(([name, { value, fill }]) => ({ name: `Entrata - ${name}`, value, fill })),
      ...Object.entries(data.uscite).map(([name, { value, fill }]) => ({ name: `Uscita - ${name}`, value, fill }))
    ];
  
    const saldo = totalEntrate - totalUscite;
  
    return { pieData, saldo, totalEntrate, totalUscite, categoryColorMap };
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

  const { categoryColorMap } = pieFinancialData();

    const barChartData = Object.entries(transactions.reduce((acc, t) => {
      if (t.tipo === 'uscita') {
        acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.importo);
      }
      return acc;
    }, {})).map(([name, value]) => ({ 
      name, 
      value,
      fill: categoryColorMap[name] || '#000000'  // Usa il colore mappato o un default
    }));

    const getYearlyOccurrences = (transaction) => {
      switch (transaction.frequenzaRicorrenza) {
        case 'Giornaliera':
          return 365;
        case 'Settimanale':
          return 52;
        case 'Mensile':
          return 12;
        case 'Annuale':
          return 1;
        default:
          return 1;
      }
    };
    
    const getTopExpenseCategories = () => {
      let totalAnnualExpenses = 0;
      const categoryExpenses = transactions.reduce((acc, t) => {
        if (t.tipo === 'uscita') {
          // Consideriamo tutte le transazioni, incluse quelle generate
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
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4">Bentornato, {userData?.nome || user.name}</h1>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      </div>
      
      {/* Sezione dei grafici */}

      {/* Grafico a torta */}
      <div className='w-full flex flex-col items-center justify-center mb-4 border-2 rounded-lg shadow-md'>
        <h2 className="text-xl font-semibold mb-2 mt-2">Ripartizione Finanziaria</h2>
        <PieExpensesGraphic data={pieFinancialData()} />
        <div className="mt-4 flex justify-between w-full px-3 items-center text-center">
          <div>
            <span className="font-bold text-green-500">Entrate totali: </span>
            €{pieFinancialData().totalEntrate.toFixed(2)}
          </div>
          <div>
            <span className="font-bold text-red-500">Uscite totali: </span>
            €{pieFinancialData().totalUscite.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Grafico Entrate/Uscite */}
        <div className='flex-col h-full border-2 p-1 rounded-lg shadow-md justify-center items-center text-center'>
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
        </div>
        
        {/* Grafico Uscite per Categoria */}
        <div className='flex-col h-full border-2 p-1 rounded-lg shadow-md justify-center items-center text-center'>
          <h2 className="text-xl font-semibold mb-2">Uscite per Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" className='text-xs' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Importo">
                {
                  barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                <Button size="sm" onClick={() => handleOpenModal(transaction)} className="mr-2 w-16 h-7 flex items-center justify-center bg-emerald-600">Modifica</Button>
                <Button size="sm" onClick={() => handleDeleteTransaction(transaction._id)} className='w-16 h-7 flex items-center justify-center bg-red-600'>Elimina</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      
      {/* Top Categorie di Spesa */}
      <Card className="mt-4">
        <h2 className="text-xl font-semibold mb-2">In cosa spendi di più (Annuale)</h2>
        {(() => {
          const { categories, totalAnnualExpenses } = getTopExpenseCategories();
          if (categories.length === 0) {
            return <p>Nessuna spesa registrata.</p>;
          }
          const maxSpend = categories[0][1].importo; // Il valore più alto
          return (
            <>
              <p className="mb-2">Spese totali annuali: {totalAnnualExpenses.toFixed(2)} €</p>
              <ul>
                {categories.map(([categoria, { importo, color }], index) => (
                  <li key={categoria} className="mb-3">
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
    </div>
  );
}