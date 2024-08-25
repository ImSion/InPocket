import React, { useState, useEffect, useContext } from 'react';
import { getGroup, updateGroup, inviteToGroup, createTask, updateTask, removeUserFromGroup, leaveGroup } from '../../Modules/ApiCrud';
import TaskList from './TaskList';
import InviteForm from './InviteForm';
import axios from 'axios';
import Calendar from './Calendar';
import { Button, Modal } from 'flowbite-react';
import { NotificationContext } from '../../Contexts/NotificationContext';

export default function GroupDetail({ group: initialGroup, onUpdate, onDelete, userData }) {
  const [group, setGroup] = useState(initialGroup);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { addNotification, showAlert  } = useContext(NotificationContext);

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
    checkOverdueTasks();
  }, [group, userData]);

  const isCreator = group.creator && group.creator._id === userData._id;

  const checkOverdueTasks = () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
    const overdueTasks = group.tasks.filter(task => {
      const createdAt = new Date(task.createdAt);
      return !task.completed && createdAt <= threeDaysAgo;
    });
  
    if (overdueTasks.length > 0) {
      addNotification({ 
        type: 'task', 
        message: `Ci sono ${overdueTasks.length} task non completate da più di 3 giorni!` 
      });
    }
  };

  const handleInvite = async (selectedUser) => {
    try {
      await inviteToGroup(group._id, selectedUser.email, userData._id);
      await refreshGroupData();
      setShowInviteForm(false);
      showAlert('Invito inviato con successo');
    } catch (error) {
      console.error('Errore nell\'invito dell\'utente:', error);
      showAlert('Errore nell\'invio dell\'invito: ' + (error.response?.data?.message || error.message), 'error');
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
        
        setGroup(prevGroup => ({
          ...prevGroup,
          members: prevGroup.members.filter(member => member._id !== userIdToRemove)
        }));
        
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
      const newTask = { 
        ...taskData, 
        createdAt: new Date(),
      };
      const response = await createTask(group._id, newTask);
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
      console.log('Dati del gruppo aggiornati:', response.data);
      setGroup(response.data);
    } catch (error) {
      console.error('Errore nel refresh dei dati del gruppo:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-2">Gruppo: {group.name}</h2>
      <p>{group.description}</p>

      <div className='flex'>
        <Button color="success" onClick={() => setShowInviteForm(true)} className="mt-4 h-10 flex justify-center items-center p-2 py-5">
          Invita Utente
        </Button>
        <Button color="info" onClick={() => setShowMembersList(true)} className="mt-4 ml-2 h-10 flex justify-center items-center p-2 py-5">
          Mostra Membri
        </Button>
        {isCreator ? (
          <Button color="failure" onClick={() => setShowDeleteModal(true)} className="mt-4 ml-2 h-10 flex justify-center items-center p-2 py-5">
            Elimina Gruppo
          </Button>
        ) : (
          <Button color="warning" onClick={handleLeaveGroup} className="mt-4 ml-2">
            Abbandona Gruppo
          </Button>
        )}
      </div>

      {showInviteForm && (
        <InviteForm 
          groupId={group._id}
          onSubmit={handleInvite}
          onCancel={() => setShowInviteForm(false)}
        />
      )}
      
      <div className="flex flex-col justify-center items-center mt-4">
        <div className="w-full">
          <Calendar 
            tasks={group.tasks} 
            onSelectDate={setSelectedDate}
          />
        </div>
        <div className="w-full">
          <TaskList 
            tasks={group.tasks.filter(task => 
              new Date(task.createdAt).toDateString() === selectedDate.toDateString()
            )}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            selectedDate={selectedDate}
          />
        </div>
      </div>

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