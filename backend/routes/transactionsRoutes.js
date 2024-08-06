import express from 'express';
import Transaction from '../models/Transactions.js';
import Users from '../models/Users.js';

const router = express.Router();

// GET: recupero tutte le transazioni di uno specifico utente
router.get('/user/:userId', async (req, res) => {
  try {
    console.log("Fetching transactions for user:", req.params.userId);
    const transactions = await Transaction.find({ user: req.params.userId });
    console.log("Transactions found:", transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET: recupero tutte le transazioni
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const transactions = await Transaction.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('user', 'nome cognome email');

        const count = await Transaction.countDocuments();

        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: recupero una transazione specifica tramite ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('user', 'nome cognome email');
        if (!transaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// POST: crea una nuova transazione
router.post('/', async (req, res) => {
    const transaction = new Transaction(req.body);
    try {
        const newTransaction = await transaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH: aggiorna parzialmente una transazione esistente
router.patch('/:id', async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });
        }
        res.json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: elimina una transazione
router.delete('/:id', async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transazione non trovata' });
        }
        res.json({ message: 'Transazione eliminata' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: ottieni il totale delle spese per un utente in un periodo specifico
router.get('/total-expenses/:userId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log('Query params:', req.query);
        const result = await Transaction.getTotalExpenses(
            req.params.userId,
            startDate ? new Date(startDate) : new Date(0),
            endDate ? new Date(endDate) : new Date()
        );
        console.log('Risultato aggregazione:', result);
        res.json(result[0] ? result[0].total : 0);
    } catch (error) {
        console.error('Errore nella route total-expenses:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: ottieni il totale delle spese per categoria per un utente in un periodo specifico
router.get('/expenses-by-category/:userId', async (req, res) => {
    try {
      const { startDate, endDate, expandCategories } = req.query;
      console.log('Query params:', req.query);
      
      let result = await Transaction.getTotalExpensesByCategory(
        req.params.userId,
        startDate ? new Date(startDate) : new Date(0),
        endDate ? new Date(endDate) : new Date()
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
  
      console.log('Risultato aggregazione:', result);
      res.json(result);
    } catch (error) {
      console.error('Errore nella route expenses-by-category:', error);
      res.status(500).json({ message: error.message });
    }
  });

export default router;