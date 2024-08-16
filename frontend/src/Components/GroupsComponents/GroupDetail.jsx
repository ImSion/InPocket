import React, { useState, useEffect } from 'react';
import { updateGroup, inviteToGroup, createTask, updateTask, removeUserFromGroup, leaveGroup } from '../../Modules/ApiCrud';
import TaskList from './TaskList';
import InviteForm from './InviteForm';
import { Button, Modal } from 'flowbite-react';

export default function GroupDetail({ group: initialGroup, onUpdate, onDelete, userData }) {
  const [group, setGroup] = useState(initialGroup);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);

  useEffect(() => {
    console.log('Gruppo ricevuto:', initialGroup);
    setGroup(initialGroup);
  }, [initialGroup]);

  const handleInvite = async (email) => {
    try {
      await inviteToGroup(group._id, email);
      onUpdate();
      // Aggiungi un feedback all'utente, ad esempio:
      alert('Invito inviato con successo');
    } catch (error) {
      console.error('Errore nell\'invito dell\'utente:', error);
      // Aggiungi un feedback all'utente, ad esempio:
      alert('Errore nell\'invio dell\'invito: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await onDelete(group._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Errore nell\'eliminazione del gruppo:', error);
    }
  };

  const handleRemoveUser = async (userIdToRemove) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo utente dal gruppo?')) {
      try {
        await removeUserFromGroup(group._id, userData._id, userIdToRemove);
        // Aggiorna lo stato o ricarica i dati del gruppo
        onUpdate();
      } catch (error) {
        console.error('Errore nella rimozione dell\'utente dal gruppo:', error);
        // Gestisci l'errore (ad esempio, mostrando un messaggio all'utente)
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Sei sicuro di voler abbandonare questo gruppo?')) {
      try {
        await leaveGroup(group._id, userData._id); // Assumendo che userData contenga l'ID dell'utente
        onUpdate();
      } catch (error) {
        console.error('Errore nell\'abbandono del gruppo:', error);
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(group._id, taskData);
      if (response.data && response.data.tasks) {
        // Assumiamo che la risposta contenga il gruppo aggiornato con la nuova task
        setGroup(response.data);
      } else {
        // Se la risposta non contiene il gruppo aggiornato, aggiungiamo manualmente la task
        setGroup(prevGroup => ({
          ...prevGroup,
          tasks: [...prevGroup.tasks, { ...taskData, _id: Date.now() }] // Usiamo un ID temporaneo
        }));
      }
      onUpdate();
    } catch (error) {
      console.error('Errore nella creazione del task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await updateTask(group._id, taskId, taskData);
      setGroup(response.data);
      onUpdate();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del task:', error);
    }
  };

  return (
    <div className="w-2/3 pl-4">
      <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
      <p>{group.description}</p>
      <Button color="success" onClick={() => setShowInviteForm(true)} className="mt-4">
        Invita Utente
      </Button>
      <Button color="info" onClick={() => setShowMembersList(true)} className="mt-4 ml-2">
        Mostra Membri
      </Button>
      {group.creator === userData._id ? (
        <Button color="failure" onClick={() => setShowDeleteModal(true)} className="mt-4 ml-2">
          Elimina Gruppo
        </Button>
      ) : (
        <Button color="warning" onClick={handleLeaveGroup} className="mt-4 ml-2">
          Abbandona Gruppo
        </Button>
      )}
      {showInviteForm && (
        <InviteForm 
          onSubmit={handleInvite} 
          onCancel={() => setShowInviteForm(false)}
        />
      )}
      <TaskList 
        tasks={group.tasks} 
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
      />

      <Modal show={showMembersList} onClose={() => setShowMembersList(false)}>
        <Modal.Header>Membri del Gruppo</Modal.Header>
        <Modal.Body>
          <ul>
          {group.members.map(member => (
  <li key={member._id} className="flex justify-between items-center mb-2">
    <div>
      <span>
        {member.nome || member.name || 'N/A'} {member.cognome || member.surname || 'N/A'}
      </span>
      <span className="ml-2 text-sm text-gray-500">
        ({member.email || 'Email non disponibile'})
      </span>
    </div>
                {group.creator === userData._id && member._id !== userData._id && (
                  <Button color="failure" size="sm" onClick={() => handleRemoveUser(member._id)}>
                    Rimuovi
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
      
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Conferma eliminazione</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Sei sicuro di voler eliminare questo gruppo? Questa azione non può essere annullata.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDeleteGroup}>
            Sì, elimina
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}