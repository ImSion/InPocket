import mongoose from 'mongoose';  // Importazione di mongoose per definire schemi e creare modelli

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },  // Descrizione del task, obbligatoria
  completed: { type: Boolean, default: false },   // Stato di completamento, default false
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },  // Riferimento all'utente che ha completato
  completionNote: { type: String },               // Nota opzionale al completamento
  scheduledDate: { type: Date, required: true },  // Data programmata, obbligatoria
  createdAt: { type: Date, default: Date.now }    // Data di creazione, default al momento attuale
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },       // Nome del gruppo, obbligatorio
    description: { type: String },                // Descrizione opzionale del gruppo
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },  // Creatore del gruppo, obbligatorio
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],  // Array di membri del gruppo
    tasks: [taskSchema]                           // Array di task usando lo schema taskSchema
  });

export default mongoose.model('Group', groupSchema);  // Creazione e esportazione del modello 'Group'