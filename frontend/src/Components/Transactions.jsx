import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Select, Checkbox } from 'flowbite-react';

// Definisco le categorie predefinite
const CATEGORIE = [
  'Alimentari',
  'Trasporti',
  'Utenze',
  'Affitto',
  'Intrattenimento',
  'Salute',
  'Abbigliamento',
  'Istruzione',
  'Regali',
  'Stipendio',
  'Altro'
];

// Definisco le opzioni di frequenza per le transazioni ricorrenti
const FREQUENZE_RICORRENZA = [
  'Giornaliera',
  'Settimanale',
  'Mensile',
  'Annuale'
];

export default function Transactions({ show, onClose, onSubmit, transaction: initialTransaction }) {
  // Stato per gestire i dati della transazione
  const [transaction, setTransaction] = useState({
    tipo: 'uscita',
    categoria: '',
    importo: '',
    descrizione: '',
    data: new Date().toISOString().split('T')[0],
    ricorrenza: false,
    frequenzaRicorrenza: 'Mensile'
  });

  // Effetto per inizializzare o resettare il form quando cambia la transazione iniziale
  useEffect(() => {
    if (initialTransaction) {
      setTransaction(initialTransaction);
    } else {
      setTransaction({
        tipo: 'uscita',
        categoria: '',
        importo: '',
        descrizione: '',
        data: new Date().toISOString().split('T')[0],
        ricorrenza: false,
        frequenzaRicorrenza: 'Mensile'
      });
    }
  }, [initialTransaction]);

  // Gestore per i cambiamenti nei campi del form
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setTransaction({ ...transaction, [e.target.name]: value });
  };

  // Gestore per l'invio del form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transaction.categoria) {
      alert('Seleziona una categoria');
      return;
    }
    onSubmit(transaction);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>{initialTransaction ? 'Modifica Transazione' : 'Aggiungi Transazione'}</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo per selezionare il tipo di transazione */}
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select id="tipo" name="tipo" value={transaction.tipo} onChange={handleChange}>
              <option value="entrata">Entrata</option>
              <option value="uscita">Uscita</option>
            </Select>
          </div>
          
          {/* Campo per selezionare la categoria */}
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select id="categoria" name="categoria" value={transaction.categoria} onChange={handleChange} required>
              <option value="">Seleziona una categoria</option>
              {CATEGORIE.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </Select>
          </div>
          
          {/* Campo per inserire l'importo */}
          <div>
            <Label htmlFor="importo">Importo</Label>
            <TextInput id="importo" name="importo" type="number" value={transaction.importo} onChange={handleChange} required />
          </div>
          
          {/* Campo per inserire la descrizione */}
          <div>
            <Label htmlFor="descrizione">Descrizione</Label>
            <TextInput id="descrizione" name="descrizione" value={transaction.descrizione} onChange={handleChange} />
          </div>
          
          {/* Campo per selezionare la data */}
          <div>
            <Label htmlFor="data">Data</Label>
            <TextInput id="data" name="data" type="date" value={transaction.data} onChange={handleChange} required />
          </div>
          
          {/* Checkbox per indicare se la transazione è ricorrente */}
          <div>
            <Checkbox 
              id="ricorrenza" 
              name="ricorrenza" 
              checked={transaction.ricorrenza} 
              onChange={handleChange}
            />
            <Label htmlFor="ricorrenza" className="ml-2">Transazione ricorrente</Label>
          </div>
          
          {/* Campo per selezionare la frequenza di ricorrenza (visibile solo se ricorrenza è true) */}
          {transaction.ricorrenza && (
            <div>
              <Label htmlFor="frequenzaRicorrenza">Frequenza di ricorrenza</Label>
              <Select 
                id="frequenzaRicorrenza" 
                name="frequenzaRicorrenza" 
                value={transaction.frequenzaRicorrenza} 
                onChange={handleChange}
              >
                {FREQUENZE_RICORRENZA.map((frequenza) => (
                  <option key={frequenza} value={frequenza}>{frequenza}</option>
                ))}
              </Select>
            </div>
          )}
          
          {/* Pulsante per inviare il form */}
          <Button type="submit">{initialTransaction ? 'Aggiorna' : 'Aggiungi'}</Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}