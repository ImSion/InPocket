import express from 'express';  // Importa il framework Express
import Group from '../models/Groups.js';  // Importa il modello Group
import Users from '../models/Users.js';  // Importa il modello Users
import Notification from '../models/Notification.js'  // Importa il modello Notification

const router = express.Router(); 

// Crea un nuovo gruppo
router.post('/', async (req, res) => {
    try {
      console.log('Dati ricevuti per la creazione del gruppo:', req.body);  // Log dei dati ricevuti
      
      // Verifica che nome del gruppo e ID del creatore siano presenti
      if (!req.body.name || !req.body.creatorId) {
        return res.status(400).json({ message: "Nome del gruppo e ID del creatore sono obbligatori" });
      }
  
      // Crea un nuovo oggetto Group
      const group = new Group({
        name: req.body.name,
        description: req.body.description,
        creator: req.body.creatorId,
        members: [req.body.creatorId]  // Il creatore è automaticamente aggiunto come membro
      });
      
      const savedGroup = await group.save();  // Salva il gruppo nel database
      console.log('Gruppo salvato:', savedGroup); 
  
      // Aggiunge il gruppo all'array dei gruppi dell'utente creatore
      await Users.findByIdAndUpdate(req.body.creatorId, {
        $push: { groups: savedGroup._id }
      });
  
      res.status(201).json(savedGroup);  // Risponde con il gruppo creato
    } catch (error) {
      console.error('Errore nella creazione del gruppo:', error);  // Log dell'errore
      res.status(400).json({ message: error.message });  // Risponde con l'errore
    }
  });

// Ottieni tutti i gruppi dell'utente
router.get('/', async (req, res) => {
  try {
    console.log('Recupero gruppi per l\'utente:', req.user._id);  // Log dell'ID utente
    const groups = await Group.find({ members: req.user._id });  // Trova tutti i gruppi di cui l'utente è membro
    console.log('Gruppi trovati:', groups.length);  // Log del numero di gruppi trovati
    res.json(groups);  // Risponde con i gruppi trovati
  } catch (error) {
    console.error('Errore nel recupero dei gruppi:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// Ottieni un gruppo specifico
router.get('/:id', async (req, res) => {
  try {
    // Trova il gruppo per ID e popola i campi members e creator
    const group = await Group.findById(req.params.id)
      .populate('members', 'nome cognome email avatar') 
      .populate('creator', 'nome cognome email avatar')
      .lean();  // Uso .lean() per ottenere un oggetto JavaScript semplice

    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Se il gruppo non esiste
    }
    res.json(group);  // Risponde con il gruppo trovato
  } catch (error) {
    console.error('Errore nel recupero del gruppo:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// Aggiorna un gruppo
router.put('/:id', async (req, res) => {
  try {
    console.log('Aggiornamento gruppo:', req.params.id);  // Log dell'ID del gruppo da aggiornare
    console.log('Dati di aggiornamento:', req.body);  // Log dei dati di aggiornamento
    // Trova e aggiorna il gruppo, assicurandosi che l'utente sia il creatore
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true }  // Restituisce il documento aggiornato
    );
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiornamento');  // Log se il gruppo non è trovato
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Risponde se il gruppo non esiste
    }
    console.log('Gruppo aggiornato:', group);  // Log del gruppo aggiornato
    res.json(group);  // Risponde con il gruppo aggiornato
  } catch (error) {
    console.error('Errore nell\'aggiornamento del gruppo:', error);  // Log dell'errore
    res.status(400).json({ message: error.message });  // Risponde con l'errore
  }
});

// Elimina un gruppo
router.delete('/:id', async (req, res) => {
  try {
    console.log('Eliminazione gruppo:', req.params.id);  // Log dell'ID del gruppo da eliminare
    const group = await Group.findByIdAndDelete(req.params.id);  // Trova e elimina il gruppo
    if (!group) {
      console.log('Gruppo non trovato per l\'eliminazione');  // Log se il gruppo non è trovato
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Risponde se il gruppo non esiste
    }

    // Rimuove il gruppo dagli array 'groups' di tutti gli utenti che ne erano membri
    await Users.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    // Rimuove gli inviti relativi al gruppo
    await Users.updateMany(
      { 'groupInvites.group': group._id },
      { $pull: { groupInvites: { group: group._id } } }
    );

    console.log('Gruppo eliminato con successo');  // Log del successo
    res.json({ message: 'Gruppo eliminato' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nell\'eliminazione del gruppo:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// Invita un utente al gruppo
router.post('/:id/invite', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Se il gruppo non esiste
    }
    
    const invitedUser = await Users.findOne({ email: req.body.email });  // Trova l'utente da invitare
    if (!invitedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });  // Se l'utente non esiste
    }

    // Verifica se l'utente è già membro del gruppo
    if (group.members.includes(invitedUser._id)) {
      return res.status(400).json({ message: 'Utente già membro del gruppo' });
    }

    // Aggiunge l'invito all'utente
    await Users.findByIdAndUpdate(invitedUser._id, {
      $addToSet: {  // Usa $addToSet per evitare duplicati
        groupInvites: {
          group: group._id,
          invitedBy: req.body.inviterId  // ID dell'utente che sta invitando
        }
      }
    });

    res.json({ message: 'Invito inviato con successo' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nell\'invio dell\'invito:', error);  // Log dell'errore
    res.status(400).json({ message: error.message });  // Risponde con l'errore
  }
});

// Ottieni le notifiche di un utente
router.get('/notifications/:userId', async (req, res) => {
  try {
    // Trova le ultime 10 notifiche dell'utente, ordinate per data di creazione decrescente
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort('-createdAt')
      .limit(10);
    res.json(notifications);  // Risponde con le notifiche trovate
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// Accetta un invito a un gruppo
router.post('/accept-invite/:inviteId', async (req, res) => {
  try {
    console.log('Accettazione invito:', req.params.inviteId);  // Log dell'ID dell'invito
    
    // Trova l'utente che ha l'invito
    const user = await Users.findOne({ 'groupInvites._id': req.params.inviteId });
    if (!user) {
      console.log('Invito non trovato');  // Log se l'invito non è trovato
      return res.status(404).json({ message: 'Invito non trovato' });  // Risponde se l'invito non esiste
    }

    // Trova l'invito specifico
    const invite = user.groupInvites.id(req.params.inviteId);
    if (!invite) {
      console.log('Invito non trovato');  // Log se l'invito non è trovato
      return res.status(404).json({ message: 'Invito non trovato' });  // Risponde se l'invito non esiste
    }

    const group = await Group.findById(invite.group);  // Trova il gruppo
    if (!group) {
      console.log('Gruppo non trovato');  // Log se il gruppo non è trovato
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Risponde se il gruppo non esiste
    }

    console.log('Aggiunta dell\'utente al gruppo');  // Log dell'operazione
    await Group.findByIdAndUpdate(group._id, {
      $addToSet: { members: user._id }  // Aggiunge l'utente ai membri del gruppo
    });

    console.log('Aggiunta del gruppo all\'utente e rimozione dell\'invito');  // Log dell'operazione
    await Users.findByIdAndUpdate(user._id, {
      $addToSet: { groups: group._id },  // Aggiunge il gruppo all'utente
      $pull: { groupInvites: { _id: invite._id } }  // Rimuove l'invito
    });

    console.log('Invito accettato con successo');  // Log del successo
    res.json({ message: 'Invito accettato con successo' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nell\'accettazione dell\'invito:', error);  // Log dell'errore
    res.status(400).json({ message: error.message });  // Risponde con l'errore
  }
});

// Rifiuta un invito a un gruppo
router.post('/reject-invite/:inviteId', async (req, res) => {
  try {
    console.log('Rifiuto invito:', req.params.inviteId);  // Log dell'ID dell'invito
    
    // Trova l'utente che ha l'invito
    const user = await Users.findOne({ 'groupInvites._id': req.params.inviteId });
    if (!user) {
      console.log('Invito non trovato');  // Log se l'invito non è trovato
      return res.status(404).json({ message: 'Invito non trovato' });  // Risponde se l'invito non esiste
    }

    // Trova l'invito specifico
    const invite = user.groupInvites.id(req.params.inviteId);
    if (!invite) {
      console.log('Invito non trovato');  // Log se l'invito non è trovato
      return res.status(404).json({ message: 'Invito non trovato' });  // Risponde se l'invito non esiste
    }

    console.log('Rimozione dell\'invito');  // Log dell'operazione
    await Users.findByIdAndUpdate(user._id, {
      $pull: { groupInvites: { _id: invite._id } }  // Rimuove l'invito
    });

    console.log('Invito rifiutato con successo');  // Log del successo
    res.json({ message: 'Invito rifiutato con successo' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nel rifiuto dell\'invito:', error);  // Log dell'errore
    res.status(400).json({ message: error.message });  // Risponde con l'errore
  }
});

// Rimuovi un utente dal gruppo (solo per il creatore)
router.post('/:id/remove-user', async (req, res) => {
  try {
    console.log('Rimozione utente dal gruppo:', req.params.id);  // Log dell'ID del gruppo
    console.log('Dati ricevuti:', req.body);  // Log dei dati ricevuti

    const { creatorId, userIdToRemove } = req.body;  // Estrae creatorId e userIdToRemove dal body

    if (!creatorId || !userIdToRemove) {
      return res.status(400).json({ message: 'creatorId e userIdToRemove sono richiesti' });  // Verifica la presenza dei dati necessari
    }

    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Se il gruppo non esiste
    }

    if (group.creator.toString() !== creatorId) {
      return res.status(403).json({ message: 'Non autorizzato' });  // Verifica che l'utente sia il creatore del gruppo
    }

    // Rimuove l'utente dal gruppo e aggiorna il documento
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userIdToRemove } },
      { new: true }
    ).populate('members', 'nome cognome email');

    // Rimuove il gruppo dall'utente
    await Users.findByIdAndUpdate(userIdToRemove, {
      $pull: { groups: req.params.id }
    });

    console.log('Gruppo aggiornato:', JSON.stringify(updatedGroup, null, 2));  // Log del gruppo aggiornato
    res.json(updatedGroup);  // Risponde con il gruppo aggiornato
  } catch (error) {
    console.error('Errore nella rimozione dell\'utente dal gruppo:', error);  // Log dell'errore
    res.status(500).json({ message: error.message, stack: error.stack });  // Risponde con l'errore
  }
});

// Abbandona il gruppo
router.post('/:id/leave', async (req, res) => {
  try {
    console.log('Tentativo di abbandonare il gruppo:', req.params.id);  // Log dell'ID del gruppo
    console.log('ID Utente:', req.body.userId);  // Log dell'ID dell'utente che vuole abbandonare

    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      console.log('Gruppo non trovato');  // Log se il gruppo non è trovato
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Risponde se il gruppo non esiste
    }

    console.log('Gruppo trovato:', group);  // Log del gruppo trovato

    if (group.creator.toString() === req.body.userId) {
      console.log('Tentativo del creatore di abbandonare il gruppo');  // Log se il creatore tenta di abbandonare
      return res.status(400).json({ message: 'Il creatore non può abbandonare il gruppo' });  // Impedisce al creatore di abbandonare
    }

    // Rimuove l'utente dai membri del gruppo
    await Group.findByIdAndUpdate(req.params.id, {
      $pull: { members: req.body.userId }
    });

    // Rimuove il gruppo dall'elenco dei gruppi dell'utente
    await Users.findByIdAndUpdate(req.body.userId, {
      $pull: { groups: req.params.id }
    });

    console.log('Utente rimosso dal gruppo con successo');  // Log del successo
    res.json({ message: 'Hai abbandonato il gruppo' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nell\'abbandono del gruppo:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

// Aggiungi un task al gruppo
router.post('/:id/tasks', async (req, res) => {
  try {
    console.log('Dati completi ricevuti per la creazione del task:', req.body);  // Log dei dati ricevuti
    
    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Se il gruppo non esiste
    }
    
    // Crea un nuovo oggetto task
    const newTask = {
      description: req.body.description,
      scheduledDate: new Date(req.body.scheduledDate),
      createdAt: new Date(req.body.createdAt || Date.now())
    };
    
    console.log('Nuovo task da aggiungere:', newTask);  // Log del nuovo task
    
    group.tasks.push(newTask);  // Aggiunge il nuovo task al gruppo
    const updatedGroup = await group.save();  // Salva le modifiche al gruppo
    
    console.log('Task aggiunto con successo');  // Log del successo
    res.status(201).json(updatedGroup);  // Risponde con il gruppo aggiornato
  } catch (error) {
    console.error('Errore dettagliato nell\'aggiunta del task:', error);  // Log dell'errore
    res.status(400).json({ message: error.message, details: error.errors });  // Risponde con l'errore
  }
});

// Aggiorna un task
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    console.log('Aggiornamento task:', req.params.taskId, 'nel gruppo:', req.params.id);  // Log dell'operazione
    console.log('Dati di aggiornamento del task:', req.body);  // Log dei dati di aggiornamento
    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiornamento del task');  // Log se il gruppo non è trovato
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Risponde se il gruppo non esiste
    }
    
    const task = group.tasks.id(req.params.taskId);  // Trova il task specifico nel gruppo
    if (!task) {
      console.log('Task non trovato');  // Log se il task non è trovato
      return res.status(404).json({ message: 'Task non trovato' });  // Risponde se il task non esiste
    }
    
    if (req.body.scheduledDate) {
      req.body.scheduledDate = new Date(req.body.scheduledDate);  // Converte la data in oggetto Date
    }
    
    Object.assign(task, req.body);  // Aggiorna il task con i nuovi dati
    await group.save();  // Salva le modifiche al gruppo
    console.log('Task aggiornato con successo:', task);  // Log del task aggiornato
    res.json(group);  // Risponde con il gruppo aggiornato
  } catch (error) {
    console.error('Errore nell\'aggiornamento del task:', error);  // Log dell'errore
    res.status(400).json({ message: error.message });  // Risponde con l'errore
  }
});

// Elimina un task
router.delete('/:id/tasks/:taskId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);  // Trova il gruppo
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });  // Se il gruppo non esiste
    }
    
    // Rimuove il task dall'array dei task del gruppo
    group.tasks = group.tasks.filter(task => task._id.toString() !== req.params.taskId);
    await group.save();  // Salva le modifiche al gruppo
    
    res.json({ message: 'Task eliminata con successo' });  // Risponde con un messaggio di successo
  } catch (error) {
    console.error('Errore nell\'eliminazione del task:', error);  // Log dell'errore
    res.status(500).json({ message: error.message });  // Risponde con l'errore
  }
});

export default router; 