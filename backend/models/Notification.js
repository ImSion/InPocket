import mongoose from 'mongoose';  

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // ID dell'utente a cui è destinata la notifica
    ref: 'users',                          // Riferimento al modello 'users'
    required: true                         // Campo obbligatorio
  },
  type: String,                            // Tipo di notifica (es. 'invito', 'task completata')
  message: String,                         // Messaggio della notifica
  createdAt: {
    type: Date,                            // Data di creazione della notifica
    default: Date.now                      // Impostata automaticamente al momento della creazione
  },
  read: {
    type: Boolean,                         // Indica se la notifica è stata letta
    default: false                         // Impostata su false di default
  }
});

export default mongoose.model('Notification', notificationSchema);  