import express from 'express';
import Group from '../models/Groups.js';
import Users from '../models/Users.js';

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

// Ottieni un gruppo specifico
router.get('/:id', async (req, res) => {
  try {
    console.log('Recupero gruppo specifico:', req.params.id);
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      console.log('Gruppo non trovato');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    console.log('Gruppo trovato:', group);
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
    const group = await Group.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!group) {
      console.log('Gruppo non trovato per l\'eliminazione');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    console.log('Rimozione del gruppo dai membri');
    await Users.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    console.log('Rimozione degli inviti relativi al gruppo');
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
    console.log('Invito a un gruppo:', req.params.id);
    console.log('Email dell\'utente invitato:', req.body.email);
    
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      console.log('Gruppo non trovato per l\'invito');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    const invitedUser = await Users.findOne({ email: req.body.email });
    if (!invitedUser) {
      console.log('Utente invitato non trovato');
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    if (group.members.includes(invitedUser._id)) {
      console.log('Utente già membro del gruppo');
      return res.status(400).json({ message: 'Utente già membro del gruppo' });
    }
    
    console.log('Aggiunta dell\'invito all\'utente');
    await Users.findByIdAndUpdate(invitedUser._id, {
      $push: {
        groupInvites: {
          group: group._id,
          invitedBy: req.user._id
        }
      }
    });

    console.log('Invito inviato con successo');
    res.json({ message: 'Invito inviato con successo' });
  } catch (error) {
    console.error('Errore nell\'invio dell\'invito:', error);
    res.status(400).json({ message: error.message });
  }
});

// Accetta un invito a un gruppo
router.post('/accept-invite/:inviteId', async (req, res) => {
  try {
    console.log('Accettazione invito:', req.params.inviteId);
    const user = await Users.findById(req.user._id);
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
      $push: { members: user._id }
    });

    console.log('Aggiunta del gruppo all\'utente e rimozione dell\'invito');
    await Users.findByIdAndUpdate(user._id, {
      $push: { groups: group._id },
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
    await Users.findByIdAndUpdate(req.user._id, {
      $pull: { groupInvites: { _id: req.params.inviteId } }
    });

    console.log('Invito rifiutato con successo');
    res.json({ message: 'Invito rifiutato con successo' });
  } catch (error) {
    console.error('Errore nel rifiuto dell\'invito:', error);
    res.status(400).json({ message: error.message });
  }
});

// Aggiungi un task al gruppo
router.post('/:id/tasks', async (req, res) => {
  try {
    console.log('Aggiunta task al gruppo:', req.params.id);
    console.log('Dati del task:', req.body);
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      console.log('Gruppo non trovato per l\'aggiunta del task');
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    group.tasks.push(req.body);
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
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
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