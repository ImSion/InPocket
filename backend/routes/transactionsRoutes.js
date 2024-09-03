import express from 'express';  // Importa il framework Express
import Transaction from '../models/Transactions.js';  // Importa il modello Transaction

const router = express.Router();

// GET: recupero tutte le transazioni di uno specifico utente
router.get('/user/:userId', async (req, res) => {
  try {
    console.log("Fetching transactions for user:", req.params.userId);  // Log dell'ID utente
    const transactions = await Transaction.find({ user: req.params.userId });  // Trova tutte le transazioni dell'utente
    console.log("Transactions found:", transactions.length);  // Log del numero di transazioni trovate
    res.json(transactions);  // Risponde con le transazioni trovate
  } catch (error) {
    console.error("Error fetching user transactions:", error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// GET: recupero tutte le transazioni (con paginazione)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;  // Estrae page e limit dalla query, con valori di default
        const transactions = await Transaction.find()
            .limit(limit)  // Limita il numero di risultati
            .skip((page - 1) * limit)  // Salta i risultati delle pagine precedenti
            .populate('user', 'nome cognome email');  // Popola il campo user con nome, cognome e email

        const count = await Transaction.countDocuments();  // Conta il numero totale di transazioni

        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(count / limit)  // Calcola il numero totale di pagine
        });
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: recupero una transazione specifica tramite ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('user', 'nome cognome email');  // Trova la transazione e popola il campo user
        if (!transaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });  // Se la transazione non esiste
        }
        res.json(transaction);  // Risponde con la transazione trovata
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// POST: crea una nuova transazione
router.post('/', async (req, res) => {
    const transaction = new Transaction(req.body);  // Crea una nuova istanza di Transaction
    try {
        const newTransaction = await transaction.save();  // Salva la nuova transazione nel database
        res.status(201).json(newTransaction);  // Risponde con la nuova transazione creata
    } catch (error) {
        res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
});

// PATCH: aggiorna parzialmente una transazione esistente
router.patch('/:id', async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }  // Restituisce il documento aggiornato e esegue i validatori
        );
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });  // Se la transazione non esiste
        }
        res.json(updatedTransaction);  // Risponde con la transazione aggiornata
    } catch (error) {
        res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
});

// DELETE: elimina una transazione
router.delete('/:id', async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);  // Trova e elimina la transazione
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });  // Se la transazione non esiste
        }
        res.json({ message: 'Transazione eliminata' });  // Risponde con un messaggio di successo
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: ottieni il totale delle spese per un utente in un periodo specifico
router.get('/total-expenses/:userId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;  // Estrae startDate e endDate dalla query
        console.log('Query params:', req.query);  // Log dei parametri della query
        const result = await Transaction.getTotalExpenses(
            req.params.userId,
            startDate ? new Date(startDate) : new Date(0),  // Se startDate non è fornito, usa la data minima
            endDate ? new Date(endDate) : new Date()  // Se endDate non è fornito, usa la data corrente
        );
        console.log('Risultato aggregazione:', result);  // Log del risultato dell'aggregazione
        res.json(result[0] ? result[0].total : 0);  // Risponde con il totale o 0 se non ci sono risultati
    } catch (error) {
        console.error('Errore nella route total-expenses:', error);  // Log dell'errore
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: ottieni il totale delle spese per categoria per un utente in un periodo specifico
router.get('/expenses-by-category/:userId', async (req, res) => {
    try {
      const { startDate, endDate, expandCategories } = req.query;  // Estrae i parametri dalla query
      console.log('Query params:', req.query);  // Log dei parametri della query
      
      let result = await Transaction.getTotalExpensesByCategory(
        req.params.userId,
        startDate ? new Date(startDate) : new Date(0),  // Se startDate non è fornito, usa la data minima
        endDate ? new Date(endDate) : new Date()  // Se endDate non è fornito, usa la data corrente
      );
  
      // Se expandCategories è specificato, espandi solo quelle categorie
      if (expandCategories) {
        const categoriesToExpand = expandCategories.split(',');
        result = result.map(category => {
          if (categoriesToExpand.includes(category._id)) {
            return category;
          } else {
            // Per le altre categorie, rimuovi l'array transactions
            const { transactions, ...rest } = category;
            return rest;
          }
        });
      } else {
        // Se expandCategories non è specificato, rimuovi l'array transactions da tutte le categorie
        result = result.map(({ transactions, ...rest }) => rest);
      }
  
      console.log('Risultato aggregazione:', result);  // Log del risultato dell'aggregazione
      res.json(result);  // Risponde con il risultato
    } catch (error) {
      console.error('Errore nella route expenses-by-category:', error);  // Log dell'errore
      res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
  });

export default router; 