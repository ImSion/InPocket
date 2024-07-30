import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const usersSchema = new mongoose.Schema(
    {
      nome: {
        type: String,
        required: true,
        trim: true //rimuove gli spazi all'inizio e alla fine della stringa
      },
      cognome: {
        type: String,
        required: true,
        trim: true 
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true 
      },
      data_di_nascita: {
        type: Date,
        trim: true,
      },
      dataRegistrazione: {
        type: Date,
        default: Date.now
      },
      impostazioni: { // campo per le impostazioni dell'utente
        valuta: {
          type: String,
          default: 'EUR'
        },
        temaInterfaccia: {
          type: String,
          default: 'light'
        }
      },
      avatar: {
        type: String,
        trim: true,
        default: "https://www.shutterstock.com/image-vector/default-avatar-profile-vector-user-260nw-1705357234.jpg"
      },
      password: {
        type: String,
        required: function() { return !this.googleid; } // La password è richiesta solo se non c'è un googleid
      },
      googleid: { 
        type: String

      }

    },
    {
       collection: 'users',
       timestamps: true 
    }
)

// Funzione che confronta la password
usersSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
};

usersSchema.pre('save', async function(next) {

  // Eseguo l'hashing solo se la password è stata modificata
  // oppure è una nuova password
  if(!this.isModified('password')) return next()

    try {
      // Genero un valore casuale con 10 round di hashing
      const salt = await bcrypt.genSalt(10);
      // E poi salvo
      this.password = await bcrypt.hash(this.password, salt)
      next();
    } catch(error) {
      // Se si verifica un errore, passo l'errore
      next(err)
    }
})

export default mongoose.model('users', usersSchema)