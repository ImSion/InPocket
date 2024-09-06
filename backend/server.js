import express from 'express'; // Importa il framework Express per creare l'applicazione web
import mongoose from 'mongoose'; // Importa Mongoose per la connessione e interazione con MongoDB
import dotenv from 'dotenv'; // Importa dotenv per caricare variabili d'ambiente da un file .env
import cors from 'cors'; // Importa CORS per gestire le richieste cross-origin
import listEndpoints from 'express-list-endpoints' // Importa utility per elencare gli endpoints dell'app
import usersRoutes from './routes/usersRoutes.js' // Importa le rotte per gli utenti
import transactionRoutes from './routes/transactionsRoutes.js'; // Importa le rotte per le transazioni
import groupsRoutes from './routes/groupsRoutes.js'; // Importa le rotte per i gruppi
import session from 'express-session'; // Importa express-session per gestire le sessioni
import './models/Users.js'; // Importa il modello Users
import './models/Groups.js'; // Importa il modello Groups

// Importa i middleware per la gestione degli errori
import {
    badRequestHandler,
    unauthorizedHandler,
    notFoundHandler,
    genericErrorHandler,
  } from "./Middlewares/errorsHandler.js";
  
  const corsOptions = {
    origin: function (origin, callback) {
      // Definiamo una whitelist di origini consentite. 
      // Queste sono gli URL da cui il nostro frontend farà richieste al backend.
      const whitelist = [
        'http://localhost:5173', // Frontend in sviluppo
        'https://in-pocket.vercel.app', // Frontend in produzione (prendere da vercel!)
        'https://inpocket.onrender.com' // URL del backend (prendere da render!)
      ];
      
      if (process.env.NODE_ENV === 'development') {
        // In sviluppo, permettiamo anche richieste senza origine (es. Postman)
        callback(null, true);
      } else if (whitelist.indexOf(origin) !== -1 || !origin) {
        // In produzione, controlliamo se l'origine è nella whitelist
        callback(null, true);
      } else {
        callback(new Error('PERMESSO NEGATO - CORS'));
      }
    },
    credentials: true // Permette l'invio di credenziali, come nel caso di autenticazione
    // basata su sessioni.
  };

dotenv.config(); // Carica le variabili d'ambiente dal file .env

const app = express(); // Crea l'applicazione Express

app.use(cors(corsOptions))
app.use(express.json()); // Middleware per parsare il corpo delle richieste JSON

// Configura la sessione
app.use(
    session({
      secret: process.env.SESSION_SECRET, // Chiave segreta per firmare il cookie di sessione
      resave: false, // Non salvare la sessione se non modificata
      saveUninitialized: false, // Non creare sessioni per richieste non inizializzate
    })
  );

// Connette a MongoDB
mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB connesso correttamente'))
.catch((err) => console.error('Errore', err))

// Definisce le rotte principali
app.use('/api/users', usersRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/groups', groupsRoutes);

const PORT = process.env.PORT || 5002 // Definisce la porta del server

// middleware per la gestione degli errori
app.use(badRequestHandler); // Gestisce errori 400 Bad Request
app.use(unauthorizedHandler); // Gestisce errori 401 Unauthorized
app.use(notFoundHandler); // Gestisce errori 404 Not Found
app.use(genericErrorHandler); // Gestisce tutti gli altri errori

// Avvia il server
app.listen(PORT, () => {
    console.log('In ascolto sulla porta ' + PORT);
    console.table(
        listEndpoints(app) // Mostra un elenco di tutti gli endpoints dell'app
    )
})