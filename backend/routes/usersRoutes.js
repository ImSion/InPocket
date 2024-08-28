import express from 'express';
import Users from '../models/Users.js';
import Notification from '../models/Notification.js';
import cloudinaryUploader from '../config/cloudinaryConfig.js';

const router = express.Router()

// GET recupero tutti gli users presenti nel DB/API
router.get('/', async (req,res) => {
    try {
        const { page=1, limit=10 } = req.query;
        const user = await Users.find()
        .limit(limit)
        .skip((page - 1) * limit)

        const count = await Users.countDocuments();

        res.json({
            user,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

router.get('/check-invites', async (req, res) => {
  try {
    const auth0Id = req.query.userId;
    
    if (!auth0Id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await Users.findOne({ 'identities.user_id': auth0Id }).select('groupInvites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasNewInvite = user.groupInvites.length > 0;
    res.json({ hasNewInvite });
  } catch (error) {
    console.error('Error checking invites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ottieni le notifiche dell'utente
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user._id; // Assumendo che l'utente sia autenticato
    const notifications = await Notification.find({ userId }).sort('-createdAt').limit(10);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Elimina una notifica
router.delete('/notifications/:id', async (req, res) => {
  try {
    const userId = req.user._id; // Assumendo che l'utente sia autenticato
    await Notification.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: 'Notifica eliminata con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ricerca utenti 
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query di ricerca mancante' });
    }
    const users = await Users.find({
      $or: [
        { nome: { $regex: q, $options: 'i' } },
        { cognome: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('nome cognome email');
    res.json(users);
  } catch (error) {
    console.error('Errore nella ricerca degli utenti:', error); 
    res.status(500).json({ message: 'Errore interno del server', error: error.message });
  }
});

// GET recupero lo user tramite l'ID generato da mongoDB, che incollerò nell'url /api/users/<id>
router.get('/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET rotta per recuperare lo user tramite email
router.get('/email/:email', async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/auth0/:auth0Id', async (req, res) => {
    try {
        const user = await Users.findOne({ 'identities.user_id': req.params.auth0Id });
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  

// POST Creo un nuovo User nel DB/API
router.post('/', async (req, res) => {
    try {
      const { auth0Id, email, nome, cognome, data_di_nascita, avatar, provider } = req.body;
      console.log("Dati ricevuti per la creazione dell'utente:", req.body);
  
      if (!email || !nome || !cognome || !data_di_nascita) {
        return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
      }
  
      let user = await Users.findOne({ 'identities.user_id': auth0Id });
  
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
        console.log("Utente aggiornato:", user);
        return res.status(200).json({ message: "Utente aggiornato", user });
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
        console.log("Nuovo utente creato:", user);
        return res.status(201).json({ message: "Nuovo utente creato", user });
      }
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      res.status(400).json({message: error.message})
    }
  });

// POST /users: crea un nuovo user
router.post('/', async (req, res) => {
    try {
        console.log("Dati ricevuti:", req.body);
        const user = new Users(req.body);
        const newUser = await user.save();
        console.log("Nuovo utente salvato:", newUser);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Errore durante il salvataggio dell'utente:", error);
        res.status(400).json({ message: error.message });
    }
});

  // PATCH Route per aggiornare parzialmente un utente esistente
  router.patch('/:id', async (req, res) => {
    try {
        console.log("Dati ricevuti per l'aggiornamento dell'utente:", req.body);
        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        console.log("Utente aggiornato:", updatedUser);
        res.json(updatedUser);
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);
        res.status(400).json({ message: error.message });
    }
});

// PATCH: aggiorna un utente tramite email
router.patch('/email/:email', async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { email: req.params.email },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// PATCH /authors/:authorId/avatar: carica un'immagine avatar per l'autore specificato
router.patch("/:id/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }

    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    user.avatar = req.file.path;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'avatar:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});


// DELETE Route per eliminare un utente
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json({ message: 'Utente eliminato' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Ottieni i gruppi e gli inviti dell'utente
router.get('/:userId/groups-and-invites', async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId)
      .populate('groups')
      .populate({
        path: 'groupInvites.group',
        model: 'Group'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({
      groups: user.groups || [],
      invites: user.groupInvites || []
    });
  } catch (error) {
    console.error('Errore nel recupero dei gruppi e degli inviti:', error);
    res.status(500).json({ message: error.message });
  }
});


export default router