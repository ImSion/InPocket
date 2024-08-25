import express from 'express';
import Group from '../models/Groups.js';
import Users from '../models/Users.js';
import Notification from '../models/Notification.js'

const router = express.Router();

// Crea un nuovo gruppo
router.post('/', async (req, res) => {
    try {
      console.log('Dati ricevuti per la creazione del gruppo:', req.body);
      
      if (!req.body.name || !req.body.creatorId) {
        return res.status(400).json({ message: "Nome del gruppo e ID del creatore sono obbligatori" });
      }
  
      const group = new Group({
        name: req.body.name,
        description: req.body.description,
        creator: req.body.creatorId,
        members: [req.body.creatorId]
      });
      
      const savedGroup = await group.save();
      console.log('Gruppo salvato:', savedGroup);
  
      // Aggiungi il gruppo all'utente creatore
      await Users.findByIdAndUpdate(req.body.creatorId, {
        $push: { groups: savedGroup._id }
      });
  
      res.status(201).json(savedGroup);
    } catch (error) {
      console.error('Errore nella creazione del gruppo:', error);
      res.status(400).json({ message: error.message });
    }
  });

// Ottieni tutti i gruppi dell'utente
router.get('/', async (req, res) => {
  try {
    console.log('Recupero gruppi per l\'utente:', req.user._id);
    const groups = await Group.find({ members: req.user._id });
    console.log('Gruppi trovati:', groups.length);
    res.json(groups);
  } catch (error) {
    console.error('Errore nel recupero dei gruppi:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    console.log('Ricerca notifiche per userId:', req.params.userId);
    const notifications = await Notification.find({ userId: req.params.userId }).sort('-createdAt');
    console.log('Notifiche trovate:', notifications);
    res.json(notifications);
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Errore nella creazione della notifica:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notifica eliminata con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione della notifica:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ottieni un gruppo specifico
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'nome cognome email')
      .populate('creator', 'nome cognome email')
      .lean();  // Usa .lean() per ottenere un oggetto JavaScript semplice

    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    res.json(group);
  } catch (error) {
    console.error('Errore nel recupero del gruppo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Aggiorna un gruppo
router.put('/:id', async (req, res) => {
  try {
    console.log('Aggiornamento gruppo:', req.params.id);
    console.log('Dati di aggiornamento:', req.body);
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true }
    );
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiornamento');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    console.log('Gruppo aggiornato:', group);
    res.json(group);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del gruppo:', error);
    res.status(400).json({ message: error.message });
  }
});

// Elimina un gruppo
router.delete('/:id', async (req, res) => {
  try {
    console.log('Eliminazione gruppo:', req.params.id);
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      console.log('Gruppo non trovato per l\'eliminazione');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    // Rimuovi il gruppo dagli utenti
    await Users.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    // Rimuovi gli inviti relativi al gruppo
    await Users.updateMany(
      { 'groupInvites.group': group._id },
      { $pull: { groupInvites: { group: group._id } } }
    );

    console.log('Gruppo eliminato con successo');
    res.json({ message: 'Gruppo eliminato' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del gruppo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Invita un utente al gruppo
router.post('/:id/invite', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    const invitedUser = await Users.findOne({ email: req.body.email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Verifica se l'utente è già membro del gruppo
    if (group.members.includes(invitedUser._id)) {
      return res.status(400).json({ message: 'Utente già membro del gruppo' });
    }

    // Aggiungi l'invito
    await Users.findByIdAndUpdate(invitedUser._id, {
      $addToSet: {
        groupInvites: {
          group: group._id,
          invitedBy: req.body.inviterId // Assicurati di inviare l'ID dell'utente che sta invitando
        }
      }
    });

    res.json({ message: 'Invito inviato con successo' });
  } catch (error) {
    console.error('Errore nell\'invio dell\'invito:', error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort('-createdAt')
      .limit(10);
    res.json(notifications);
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    res.status(500).json({ message: error.message });
  }
});

// Accetta un invito a un gruppo
router.post('/accept-invite/:inviteId', async (req, res) => {
  try {
    console.log('Accettazione invito:', req.params.inviteId);
    
    // Trova l'utente che ha l'invito
    const user = await Users.findOne({ 'groupInvites._id': req.params.inviteId });
    if (!user) {
      console.log('Invito non trovato');
      return res.status(404).json({ message: 'Invito non trovato' });
    }

    // Trova l'invito specifico
    const invite = user.groupInvites.id(req.params.inviteId);
    if (!invite) {
      console.log('Invito non trovato');
      return res.status(404).json({ message: 'Invito non trovato' });
    }

    const group = await Group.findById(invite.group);
    if (!group) {
      console.log('Gruppo non trovato');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    console.log('Aggiunta dell\'utente al gruppo');
    await Group.findByIdAndUpdate(group._id, {
      $addToSet: { members: user._id }
    });

    console.log('Aggiunta del gruppo all\'utente e rimozione dell\'invito');
    await Users.findByIdAndUpdate(user._id, {
      $addToSet: { groups: group._id },
      $pull: { groupInvites: { _id: invite._id } }
    });

    console.log('Invito accettato con successo');
    res.json({ message: 'Invito accettato con successo' });
  } catch (error) {
    console.error('Errore nell\'accettazione dell\'invito:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rifiuta un invito a un gruppo
router.post('/reject-invite/:inviteId', async (req, res) => {
  try {
    console.log('Rifiuto invito:', req.params.inviteId);
    
    // Trova l'utente che ha l'invito
    const user = await Users.findOne({ 'groupInvites._id': req.params.inviteId });
    if (!user) {
      console.log('Invito non trovato');
      return res.status(404).json({ message: 'Invito non trovato' });
    }

    // Trova l'invito specifico
    const invite = user.groupInvites.id(req.params.inviteId);
    if (!invite) {
      console.log('Invito non trovato');
      return res.status(404).json({ message: 'Invito non trovato' });
    }

    console.log('Rimozione dell\'invito');
    await Users.findByIdAndUpdate(user._id, {
      $pull: { groupInvites: { _id: invite._id } }
    });

    console.log('Invito rifiutato con successo');
    res.json({ message: 'Invito rifiutato con successo' });
  } catch (error) {
    console.error('Errore nel rifiuto dell\'invito:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rimuovi un utente dal gruppo (solo per il creatore)
router.post('/:id/remove-user', async (req, res) => {
  try {
    console.log('Rimozione utente dal gruppo:', req.params.id);
    console.log('Dati ricevuti:', req.body);

    const { creatorId, userIdToRemove } = req.body;

    if (!creatorId || !userIdToRemove) {
      return res.status(400).json({ message: 'creatorId e userIdToRemove sono richiesti' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    if (group.creator.toString() !== creatorId) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userIdToRemove } },
      { new: true }
    ).populate('members', 'nome cognome email');

    await Users.findByIdAndUpdate(userIdToRemove, {
      $pull: { groups: req.params.id }
    });

    console.log('Gruppo aggiornato:', JSON.stringify(updatedGroup, null, 2));
    res.json(updatedGroup);
  } catch (error) {
    console.error('Errore nella rimozione dell\'utente dal gruppo:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Abbandona il gruppo
router.post('/:id/leave', async (req, res) => {
  try {
    console.log('Tentativo di abbandonare il gruppo:', req.params.id);
    console.log('ID Utente:', req.body.userId); // Assumiamo che l'ID dell'utente venga inviato nel corpo della richiesta

    const group = await Group.findById(req.params.id);
    if (!group) {
      console.log('Gruppo non trovato');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    console.log('Gruppo trovato:', group);

    if (group.creator.toString() === req.body.userId) {
      console.log('Tentativo del creatore di abbandonare il gruppo');
      return res.status(400).json({ message: 'Il creatore non può abbandonare il gruppo' });
    }

    await Group.findByIdAndUpdate(req.params.id, {
      $pull: { members: req.body.userId }
    });

    await Users.findByIdAndUpdate(req.body.userId, {
      $pull: { groups: req.params.id }
    });

    console.log('Utente rimosso dal gruppo con successo');
    res.json({ message: 'Hai abbandonato il gruppo' });
  } catch (error) {
    console.error('Errore nell\'abbandono del gruppo:', error);
    res.status(500).json({ message: error.message });
  }
});


// Aggiungi un task al gruppo
router.post('/:id/tasks', async (req, res) => {
  try {
    console.log('Aggiunta task al gruppo:', req.params.id);
    console.log('Dati del task:', req.body);
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiunta del task');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    group.tasks.push({
      ...req.body,
      createdAt: new Date() // Assicuriamoci che createdAt sia sempre impostato
    });
    await group.save();
    console.log('Task aggiunto con successo');
    res.status(201).json(group);
  } catch (error) {
    console.error('Errore nell\'aggiunta del task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Aggiorna un task
router.put('/:id/tasks/:taskId', async (req, res) => {
  try {
    console.log('Aggiornamento task:', req.params.taskId, 'nel gruppo:', req.params.id);
    console.log('Dati di aggiornamento del task:', req.body);
    const group = await Group.findById(req.params.id);
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiornamento del task');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    const task = group.tasks.id(req.params.taskId);
    if (!task) {
      console.log('Task non trovato');
      return res.status(404).json({ message: 'Task non trovato' });
    }
    
    Object.assign(task, req.body);
    await group.save();
    console.log('Task aggiornato con successo');
    res.json(group);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del task:', error);
    res.status(400).json({ message: error.message });
  }
});



export default router;