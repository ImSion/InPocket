import React, { useState, useEffect } from 'react';
import { updateGroup, inviteToGroup, createTask, updateTask } from '../../Modules/ApiCrud';
import TaskList from './TaskList';
import InviteForm from './InviteForm';
import { Button, Modal } from 'flowbite-react';

export default function GroupDetail({ group: initialGroup, onUpdate, onDelete, userData }) {
  const [group, setGroup] = useState(initialGroup);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
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
      <Button 
        color="success"
        onClick={() => setShowInviteForm(true)}
        className="mt-4"
      >
        Invita Utente
      </Button>
      {group.creator === userData._id && (
        <Button 
          color="failure"
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 ml-2"
        >
          Elimina Gruppo
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