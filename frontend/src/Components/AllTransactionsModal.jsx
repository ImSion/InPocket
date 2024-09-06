import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'flowbite-react';
import moment from 'moment';

export default function AllTransactionsModal({ show, onClose, transactions }) {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [groupedTransactions, setGroupedTransactions] = useState({});

  useEffect(() => {
    const grouped = transactions.reduce((acc, transaction) => {
      const month = moment(transaction.data).format('YYYY-MM');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    }, {});
    setGroupedTransactions(grouped);
  }, [transactions]);

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => prev.clone().add(direction, 'month'));
  };

  const currentMonthKey = currentMonth.format('YYYY-MM');
  const currentTransactions = groupedTransactions[currentMonthKey] || [];

  // Calcolo dei totali
  const totals = currentTransactions.reduce((acc, transaction) => {
    if (transaction.tipo === 'entrata') {
      acc.entrate += transaction.importo;
    } else {
      acc.uscite += transaction.importo;
    }
    return acc;
  }, { entrate: 0, uscite: 0 });

  return (
    <Modal show={show} onClose={onClose} size="xl">
      <Modal.Header>Tutte le Transazioni</Modal.Header>
      <Modal.Body>
        <div className="flex justify-between mb-4">
          <Button onClick={() => navigateMonth(-1)}>Indietro</Button>
          <h2>{currentMonth.format('MMMM YYYY')}</h2>
          <Button onClick={() => navigateMonth(1)}>Avanti</Button>
        </div>
        <ul className="mb-4">
          {currentTransactions.map((transaction, index) => (
            <li key={index} className="mb-2 p-2 border-b">
              <div className="flex justify-between">
                <span>{transaction.descrizione}</span>
                <span className={transaction.tipo === 'entrata' ? 'text-green-500' : 'text-red-500'}>
                  {transaction.tipo === 'entrata' ? '+' : '-'}€{transaction.importo.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {moment(transaction.data).format('DD/MM/YYYY')} - {transaction.categoria}
              </div>
            </li>
          ))}
        </ul>
        {currentTransactions.length === 0 ? (
          <p className="text-center text-gray-500">Nessuna transazione per questo mese.</p>
        ) : (
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Totale Entrate:</span>
              <span className="text-green-500">€{totals.entrate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Totale Uscite:</span>
              <span className="text-red-500">€{totals.uscite.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 text-lg">
              <span>Bilancio:</span>
              <span className={totals.entrate - totals.uscite >= 0 ? 'text-green-500' : 'text-red-500'}>
                €{(totals.entrate - totals.uscite).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Chiudi</Button>
      </Modal.Footer>
    </Modal>
  );
}