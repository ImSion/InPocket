import express from 'express';  // Importa il framework Express
import Users from '../models/Users.js';  // Importa il modello Users
import Notification from '../models/Notification.js';  // Importa il modello Notification
import cloudinaryUploader from '../config/cloudinaryConfig.js';  // Importa la configurazione di Cloudinary

const router = express.Router()  

// GET: recupero tutti gli users presenti nel DB/API (con paginazione)
router.get('/', async (req,res) => {
    try {
        const { page=1, limit=10 } = req.query;  // Estrae page e limit dalla query, con valori di default
        const user = await Users.find()
        .limit(limit)  // Limita il numero di risultati
        .skip((page - 1) * limit)  // Salta i risultati delle pagine precedenti

        const count = await Users.countDocuments();  // Conta il numero totale di utenti

        res.json({
            user,
            currentPage: page,
            totalPages: Math.ceil(count / limit)  // Calcola il numero totale di pagine
        })
    } catch (error) {
        res.status(500).json({message: error.message})  // Risponde con l'errore
    }
})

// GET: controlla se l'utente ha nuovi inviti
router.get('/check-invites', async (req, res) => {
  try {
    const auth0Id = req.query.userId;  // Ottiene l'ID utente dalla query
    
    if (!auth0Id) {
      return res.status(400).json({ message: 'User ID is required' });  // Se l'ID utente non è fornito
    }

    const user = await Users.findOne({ 'identities.user_id': auth0Id }).select('groupInvites');  // Trova l'utente e seleziona solo groupInvites
    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // Se l'utente non esiste
    }

    const hasNewInvite = user.groupInvites.length > 0;  // Controlla se ci sono nuovi inviti
    res.json({ hasNewInvite });  // Risponde con il risultato
  } catch (error) {
    console.error('Error checking invites:', error);  // Log dell'errore
    res.status(500).json({ message: 'Internal server error' });  // Risponde con l'errore
  }
});

// GET: ottieni le notifiche dell'utente
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user._id;  // Assume che l'utente sia autenticato
    const notifications = await Notification.find({ userId }).sort('-createdAt').limit(10);  // Trova le ultime 10 notifiche dell'utente
    res.json(notifications);  // Risponde con le notifiche
  } catch (error) {
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// DELETE: elimina una notifica
router.delete('/notifications/:id', async (req, res) => {
  try {
    const userId = req.user._id;  // Assume che l'utente sia autenticato
    await Notification.findOneAndDelete({ _id: req.params.id, userId });  // Trova e elimina la notifica
    res.json({ message: 'Notifica eliminata con successo' });  // Risponde con un messaggio di successo
  } catch (error) {
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// GET: ricerca utenti 
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;  // Ottiene la query di ricerca
    if (!q) {
      return res.status(400).json({ message: 'Query di ricerca mancante' });  // Se la query è mancante
    }
    const users = await Users.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },  // Cerca nel nome (case-insensitive)
        { cognome: { $regex: q, $options: 'i' } },  // Cerca nel cognome (case-insensitive)
        { email: { $regex: q, $options: 'i' } }  // Cerca nell'email (case-insensitive)
      ]
    }).limit(10).select('nome cognome email');  // Limita a 10 risultati e seleziona solo nome, cognome e email
    res.json(users);  // Risponde con gli utenti trovati
  } catch (error) {
    console.error('Errore nella ricerca degli utenti:', error);  // Log dell'errore
    res.status(500).json({ message: 'Errore interno del server', error: error.message });  // Risponde con l'errore
  }
});

// GET: recupera lo user tramite l'ID
router.get('/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);  // Trova l'utente per ID
        if (user == null) {
            return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
        }
        res.json(user);  // Risponde con l'utente trovato
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: recupera lo user tramite email
router.get('/email/:email', async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.params.email });  // Trova l'utente per email
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
        }
        res.json(user);  // Risponde con l'utente trovato
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: recupera lo user tramite Auth0 ID
router.get('/auth0/:auth0Id', async (req, res) => {
    try {
        const user = await Users.findOne({ 'identities.user_id': req.params.auth0Id });  // Trova l'utente per Auth0 ID
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });  // Se l'utente non esiste
        }
        res.json(user);  // Risponde con l'utente trovato
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// POST: crea un nuovo User nel DB/API o aggiorna uno esistente
router.post('/', async (req, res) => {
    try {
      const { auth0Id, email, nome, cognome, data_di_nascita, avatar, provider } = req.body;
      console.log("Dati ricevuti per la creazione dell'utente:", req.body);  // Log dei dati ricevuti
  
      if (!email || !nome || !cognome || !data_di_nascita) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });  // Verifica che tutti i campi necessari siano presenti
      }
  
      let user = await Users.findOne({ 'identities.user_id': auth0Id });  // Cerca un utente esistente con lo stesso Auth0 ID
  
      if (user) {
        // Aggiorna l'utente esistente
        user.nome = nome;
        user.cognome = cognome;
        user.email = email;
        user.data_di_nascita = data_di_nascita;
        user.avatar = avatar || user.avatar;
        user.isProfileComplete = true;
        
        // Aggiungi o aggiorna l'identità
        const identityIndex = user.identities.findIndex(id => id.provider === provider);
        if (identityIndex > -1) {
          user.identities[identityIndex].user_id = auth0Id;
        } else {
          user.identities.push({ provider, user_id: auth0Id });
        }
  
        await user.save();
        console.log("Utente aggiornato:", user);  // Log dell'utente aggiornato
        return res.status(200).json({ message: "Utente aggiornato", user });  // Risponde con l'utente aggiornato
      } else {
        // Crea un nuovo utente
        user = new Users({
          email,
          nome,
          cognome,
          data_di_nascita,
          avatar,
          identities: [{ provider, user_id: auth0Id }],
          isProfileComplete: true
        });
        await user.save();
        console.log("Nuovo utente creato:", user);  // Log del nuovo utente creato
        return res.status(201).json({ message: "Nuovo utente creato", user });  // Risponde con il nuovo utente
      }
    } catch (error) {
      console.error("Errore durante la registrazione:", error);  // Log dell'errore
      res.status(400).json({message: error.message})  // Risponde con l'errore
    }
  });

// POST: crea un nuovo user (duplicato della route precedente, potrebbe essere rimosso)
router.post('/', async (req, res) => {
    try {
        console.log("Dati ricevuti:", req.body);  // Log dei dati ricevuti
        const user = new Users(req.body);  // Crea un nuovo utente
        const newUser = await user.save();  // Salva il nuovo utente
        console.log("Nuovo utente salvato:", newUser);  // Log del nuovo utente salvato
        res.status(201).json(newUser);  // Risponde con il nuovo utente
    } catch (error) {
        console.error("Errore durante il salvataggio dell'utente:", error);  // Log dell'errore
        res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
});

// PATCH: aggiorna parzialmente un utente esistente
router.patch('/:id', async (req, res) => {
    try {
        console.log("Dati ricevuti per l'aggiornamento dell'utente:", req.body);  // Log dei dati ricevuti
        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }  // Restituisce il documento aggiornato e esegue i validatori
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
        }
        console.log("Utente aggiornato:", updatedUser);  // Log dell'utente aggiornato
        res.json(updatedUser);  // Risponde con l'utente aggiornato
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);  // Log dell'errore
        res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
});

// PATCH: aggiorna un utente tramite email
router.patch('/email/:email', async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { email: req.params.email },
        req.body,
        { new: true, runValidators: true }  // Restituisce il documento aggiornato e esegue i validatori
      );
      if (!updatedUser) {
        return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
      }
      res.json(updatedUser);  // Risponde con l'utente aggiornato
    } catch (error) {
      res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
  });

// PATCH: carica un'immagine avatar per l'utente specificato
router.patch("/:id/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });  // Se nessun file è stato caricato
    }

    const user = await Users.findById(req.params.id);  // Trova l'utente
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });  // Se l'utente non esiste
    }

    user.avatar = req.file.path;  // Aggiorna l'URL dell'avatar
    await user.save();  // Salva le modifiche

    res.json(user);  // Risponde con l'utente aggiornato
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'avatar:", error);  // Log dell'errore
    res.status(500).json({ message: "Errore interno del server" });  // Risponde con l'errore
  }
});

// DELETE: elimina un utente
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);  // Trova e elimina l'utente
        if (!deletedUser) {
            return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
        }
        res.json({ message: 'Utente eliminato' });  // Risponde con un messaggio di successo
    } catch (error) {
        res.status(500).json({ message: error.message });  // Risponde con l'errore
    }
});

// GET: ottieni i gruppi e gli inviti dell'utente
router.get('/:userId/groups-and-invites', async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId)
      .populate('groups')  // Popola i dettagli dei gruppi
      .populate({
        path: 'groupInvites.group',
        model: 'Group'
      });  // Popola i dettagli dei gruppi negli inviti
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
    }

    res.json({
      groups: user.groups || [],
      invites: user.groupInvites || []
    });  // Risponde con i gruppi e gli inviti dell'utente
  } catch (error) {
    console.error('Errore nel recupero dei gruppi e degli inviti:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

export default router  