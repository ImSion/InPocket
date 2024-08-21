import React, { useState, useEffect } from 'react';
import { getGroup, updateGroup, inviteToGroup, createTask, updateTask, removeUserFromGroup, leaveGroup } from '../../Modules/ApiCrud';
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

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await getGroup(initialGroup._id);
        console.log('Dettagli del gruppo recuperati:', response.data);
        setGroup(response.data);
      } catch (error) {
        console.error('Errore nel recupero dei dettagli del gruppo:', error);
      }
    };
  
    fetchGroupDetails();
  }, [initialGroup._id]);

  useEffect(() => {
    console.log('Group creator:', group.creator);
    console.log('Current user ID:', userData._id);
  }, [group, userData]);

  const isCreator = group.creator && group.creator._id === userData._id;

  const handleInvite = async (selectedUser) => {
    try {
      if (!selectedUser || !selectedUser.email) {
        throw new Error('Dati utente non validi per l\'invito');
      }
      await inviteToGroup(group._id, selectedUser.email);
      await refreshGroupData();
      setShowInviteForm(false);
      alert('Invito inviato con successo');
    } catch (error) {
      console.error('Errore nell\'invito dell\'utente:', error);
      alert('Errore nell\'invio dell\'invito: ' + (error.message || 'Errore sconosciuto'));
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
        console.log('Rimozione utente:', userIdToRemove);
        console.log('ID del gruppo:', group._id);
        console.log('ID del creatore:', userData._id);
        const response = await removeUserFromGroup(group._id, userData._id, userIdToRemove);
        console.log('Risposta dal server:', response.data);
        
        // Aggiorna lo stato del gruppo con i nuovi dati
        setGroup(prevGroup => ({
          ...prevGroup,
          members: prevGroup.members.filter(member => member._id !== userIdToRemove)
        }));
        
        // Ricarica i dati completi del gruppo
        await refreshGroupData();
        
        onUpdate();
      } catch (error) {
        console.error('Errore nella rimozione dell\'utente dal gruppo:', error.response?.data || error.message);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Sei sicuro di voler abbandonare questo gruppo?')) {
      try {
        await leaveGroup(group._id, userData._id);
        onUpdate();
      } catch (error) {
        console.error('Errore nell\'abbandono del gruppo:', error);
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(group._id, taskData);
      await refreshGroupData();
    } catch (error) {
      console.error('Errore nella creazione del task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await updateTask(group._id, taskId, taskData);
      await refreshGroupData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del task:', error);
    }
  };

  const refreshGroupData = async () => {
    try {
      const response = await getGroup(group._id);
      console.log('Dati del gruppo aggiornati:', response.data);  // Log per debugging
      setGroup(response.data);
    } catch (error) {
      console.error('Errore nel refresh dei dati del gruppo:', error);
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
      {isCreator ? (
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
          groupId={group._id}
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
              {isCreator && member._id !== userData._id && (
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