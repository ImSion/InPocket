import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',  // Questo fa riferimento al nome del modello 'users'
    required: true
  },
  tipo: {
    type: String,
    enum: ['entrata', 'uscita'],
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  importo: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  descrizione: String,
  ricorrenza: {
    type: Boolean,
    default: false
  },
  frequenzaRicorrenza: {
    type: String,
    enum: ['Giornaliera', 'Settimanale', 'Mensile', 'Annuale'],
    required: function() { return this.ricorrenza; }
  }
}, {
  timestamps: true
});

// Metodi statici per le query aggregate
transactionSchema.statics.getTotalExpenses = async function(userId, startDate, endDate) {
    console.log('Parametri ricevuti:', { userId, startDate, endDate });
    return this.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId.createFromHexString(userId),
          tipo: 'uscita',
          $or: [
            { data: { $gte: startDate, $lte: endDate } },
            { data: null }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$importo' }
        }
      }
    ]);
  };

  transactionSchema.statics.getTotalExpensesByCategory = async function(userId, startDate, endDate) {
    console.log('Parametri ricevuti:', { userId, startDate, endDate });
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID utente non valido');
    }
  
    return this.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId.createFromHexString(userId),
          tipo: 'uscita',
          $or: [
            { data: { $gte: startDate, $lte: endDate } },
            { data: null }
          ]
        }
      },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$importo' },
          transactions: {
            $push: {
              id: '$_id',
              importo: '$importo',
              descrizione: '$descrizione',
              data: '$data'
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
  };

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;