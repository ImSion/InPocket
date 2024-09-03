import mongoose from 'mongoose'; 
import bcrypt from 'bcrypt'  // Importa bcrypt per l'hashing delle password

const usersSchema = new mongoose.Schema(
    {
      nome: {
        type: String,  // Il nome è una stringa
        trim: true  // Rimuove gli spazi all'inizio e alla fine della stringa
      },
      cognome: {
        type: String,  // Il cognome è una stringa
        trim: true  
      },
      email: {
        type: String,  // L'email è una stringa
        required: true,  // Campo obbligatorio
        trim: true,  
        unique: function() { return !this.email.endsWith('@example.com'); }  // Email unica se non termina con @example.com
      },
      data_di_nascita: {
        type: Date,  // La data di nascita è di tipo Date
        trim: true,  // Rimuove gli spazi (anche se non ha effetto su Date)
      },
      dataRegistrazione: {
        type: Date,  // La data di registrazione è di tipo Date
        default: Date.now  // Valore predefinito: data corrente
      },
      impostazioni: {  // Oggetto per le impostazioni dell'utente
        valuta: {
          type: String,  // La valuta è una stringa
          default: 'EUR'  // Valore predefinito: EUR
        },
        temaInterfaccia: {
          type: String,  // Il tema dell'interfaccia è una stringa
          default: 'light'  // Valore predefinito: light
        }
      },
      avatar: {
        type: String,  // L'URL dell'avatar è una stringa
        trim: true,  // Rimuove gli spazi all'inizio e alla fine della stringa
        default: "https://www.shutterstock.com/image-vector/default-avatar-profile-vector-user-260nw-1705357234.jpg"  // Avatar predefinito
      },
      password: {
        type: String,  // La password (hashata) è una stringa
      },
      isProfileComplete: {
        type: Boolean,  // Flag per indicare se il profilo è completo
        default: false  // Valore predefinito: false
      },
      identities: [{  // Array di identità per autenticazione esterna
        provider: String,  // Provider di autenticazione
        user_id: String  // ID utente del provider
      }],
      groups: [{  // Array di gruppi a cui l'utente appartiene
        type: mongoose.Schema.Types.ObjectId,  // Riferimento all'ID del gruppo
        ref: 'Group'  // Riferimento al modello Group
      }],
      groupInvites: [{  // Array di inviti ai gruppi
        group: {
          type: mongoose.Schema.Types.ObjectId,  // Riferimento all'ID del gruppo
          ref: 'Group'  // Riferimento al modello Group
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,  // Riferimento all'ID dell'utente che ha inviato l'invito
          ref: 'users'  // Riferimento al modello users
        },
        createdAt: {
          type: Date,  // Data di creazione dell'invito
          default: Date.now  // Valore predefinito: data corrente
        }
      }]
    },
    {
       collection: 'users',  // Nome della collezione in MongoDB
       timestamps: true  // Aggiunge automaticamente i campi createdAt e updatedAt
    }
)

// Metodo per confrontare la password fornita con quella hashata nel database
usersSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)  // Utilizza bcrypt per confrontare le password
};

// Middleware pre-save per l'hashing della password
usersSchema.pre('save', async function(next) {
  // Esegue l'hashing solo se la password è stata modificata o è nuova
  if(!this.isModified('password') || !this.password) return next()

    try {
      // Genera un salt con 10 round di hashing
      const salt = await bcrypt.genSalt(10);
      // Hasha la password con il salt generato
      this.password = await bcrypt.hash(this.password, salt)
      next();
    } catch(error) {
      // Se si verifica un errore, passa l'errore al middleware successivo
      next(error)
    }
})

export default mongoose.model('users', usersSchema)  // Crea e esporta il modello 'users' basato sullo schema definito