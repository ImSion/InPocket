import express from 'express';
import Users from '../models/Users.js';
import { cloudinaryUploader } from '../config/cloudinaryConfig.js'

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

// POST Creo un nuovo User nel DB/API
router.post('/', async (req, res) => {
    try {
        const { auth0Id, email, nome, cognome, password, avatar, provider } = req.body;
        console.log("Dati ricevuti:", req.body);

        if (!email) {
            return res.status(400).json({ message: "Email è obbligatoria" });
        }

        let user = await Users.findOne({ email });

        if (user) {
            // Aggiorna l'utente esistente
            user.nome = nome || user.nome;
            user.cognome = cognome || user.cognome;
            user.avatar = avatar || user.avatar;
            
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
                password,
                avatar,
                identities: [{ provider, user_id: auth0Id }]
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
        const updateUser = await Users.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true });
        if (!updateUser) {
            return res.status(404).json({ message: 'Utente non trovato' });
        } else {
           res.json(updateUser);
        }
    } catch (error) {
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
router.patch("/:userId/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
    try {
      // Verifica se è stato caricato un file, se non l'ho caricato rispondo con un 400
      if (!req.file) {
        return res.status(400).json({ message: "Nessun file caricato" });
      }
  
      // Cerca l'autore nel database, se non esiste rispondo con una 404
      const user = await Users.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "Autore non trovato" });
      }
  
      // Aggiorna l'URL dell'avatar dell'autore con l'URL fornito da Cloudinary
      user.avatar = req.file.path;
  
      // Salva le modifiche nel db
      await user.save();
  
      // Invia la risposta con l'autore aggiornato
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


export default router