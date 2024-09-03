import mongoose from 'mongoose'; 

const transactionSchema = new mongoose.Schema({  
  user: {
    type: mongoose.Schema.Types.ObjectId,  // Il campo user è un ObjectId, che rappresenta un riferimento a un altro documento
    ref: 'users',  // Specifica che questo campo fa riferimento al modello 'users'
    required: true  // Rende questo campo obbligatorio per ogni transazione
  },
  tipo: {
    type: String,  // Il tipo di transazione è una stringa
    enum: ['entrata', 'uscita'],  // Limita i valori possibili a 'entrata' o 'uscita'
    required: true  // Rende questo campo obbligatorio
  },
  categoria: {
    type: String,  // La categoria è una stringa
    required: true  // Rende questo campo obbligatorio
  },
  importo: {
    type: Number,  // L'importo è un numero
    required: true  // Rende questo campo obbligatorio
  },
  data: {
    type: Date,  // La data è di tipo Date
    default: Date.now  // Se non specificata, usa la data corrente come valore predefinito
  },
  descrizione: String,  // La descrizione è una stringa opzionale
  ricorrenza: {
    type: Boolean,  // Indica se la transazione è ricorrente (true/false)
    default: false  // Il valore predefinito è false
  },
  frequenzaRicorrenza: {
    type: String,  // La frequenza di ricorrenza è una stringa
    enum: ['Giornaliera', 'Settimanale', 'Mensile', 'Annuale'],  // Limita i valori possibili
    required: function() { return this.ricorrenza; }  // È richiesto solo se ricorrenza è true
  }
}, {
  timestamps: true  // Aggiunge automaticamente i campi createdAt e updatedAt
});

// Metodo statico per calcolare il totale delle spese per un utente in un periodo specifico
transactionSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
    console.log('Parametri ricevuti:', { userId, startDate, endDate });  // Log dei parametri per debug
    return this.aggregate([  // Inizia una pipeline di aggregazione
      {
        $match: {  // Fase di filtro dei documenti
          user: mongoose.Types.ObjectId.createFromHexString(userId),  // Converte l'userId in ObjectId
          tipo: 'uscita',  // Filtra solo le transazioni di tipo 'uscita'
          $or: [  // Condizione OR per la data
            { data: { $gte: startDate, $lte: endDate } },  // Data compresa nel range specificato
            { data: null }  // O data non specificata
          ]
        }
      },
      {
        $group: {  // Fase di raggruppamento
          _id: null,  // Raggruppa tutti i documenti insieme
          total: { $sum: '$importo' }  // Calcola la somma totale degli importi
        }
      }
    ]);
  };

// Metodo statico per calcolare il totale delle spese per categoria
transactionSchema.statics.getTotalExpensesByCategory = async function(userId, startDate, endDate) {
    console.log('Parametri ricevuti:', { userId, startDate, endDate });  // Log dei parametri per debug
    if (!mongoose.Types.ObjectId.isValid(userId)) {  // Verifica la validità dell'userId
      throw new Error('ID utente non valido');  // Lancia un errore se l'ID non è valido
    }
  
    return this.aggregate([  // Inizia una pipeline di aggregazione
      {
        $match: {  // Fase di filtro dei documenti
          user: mongoose.Types.ObjectId.createFromHexString(userId),  // Converte l'userId in ObjectId
          tipo: 'uscita',  // Filtra solo le transazioni di tipo 'uscita'
          $or: [  // Condizione OR per la data
            { data: { $gte: startDate, $lte: endDate } },  // Data compresa nel range specificato
            { data: null }  // O data non specificata
          ]
        }
      },
      {
        $group: {  // Fase di raggruppamento
          _id: '$categoria',  // Raggruppa per categoria
          total: { $sum: '$importo' },  // Calcola la somma totale per ogni categoria
          transactions: {  // Crea un array di transazioni per ogni categoria
            $push: {  // Aggiunge ogni transazione all'array
              id: '$_id',  // Include l'ID della transazione
              importo: '$importo',  // Include l'importo
              descrizione: '$descrizione',  // Include la descrizione
              data: '$data'  // Include la data
            }
          }
        }
      },
      {
        $sort: { total: -1 }  // Ordina i risultati per totale in ordine decrescente
      }
    ]);
  };

const Transaction = mongoose.model('Transaction', transactionSchema); 

export default Transaction;  // Esporta il modello per l'uso in altre parti dell'applicazione