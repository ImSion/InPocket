import React, { useState, useEffect, useContext } from 'react';
import { getGroup, updateGroup, inviteToGroup, createTask, updateTask, removeUserFromGroup, leaveGroup } from '../../Modules/ApiCrud';
import TaskList from './TaskList';
import InviteForm from './InviteForm';
import axios from 'axios';
import Calendar from './Calendar';
import { deleteTask } from '../../Modules/ApiCrud';
import { Button, Modal, Avatar } from 'flowbite-react';
import { NotificationContext } from '../../Contexts/NotificationContext';

export default function GroupDetail({ group: initialGroup, onUpdate, onDelete, userData }) {
  const [group, setGroup] = useState(initialGroup);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState(null);
  const { addNotification, showAlert  } = useContext(NotificationContext);

  useEffect(() => {
    // console.log('Gruppo ricevuto:', initialGroup);
    setGroup(initialGroup);
  }, [initialGroup]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await getGroup(initialGroup._id);
        // console.log('Dettagli del gruppo recuperati:', response.data);
        setGroup(response.data);
      } catch (error) {
        console.error('Errore nel recupero dei dettagli del gruppo:', error);
      }
    };
  
    fetchGroupDetails();
  }, [initialGroup._id]);

  useEffect(() => {
    // console.log('Group creator:', group.creator);
    // console.log('Current user ID:', userData._id);
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

  const handleMemberClick = (member) => {
    setSelectedMember(selectedMember === member ? null : member);
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
        scheduledDate: selectedDate.toISOString(),
        createdAt: new Date().toISOString(),
      };
      console.log('Creazione nuova task:', newTask);
      const response = await createTask(group._id, newTask);
      console.log('Risposta creazione task:', response);
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

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(group._id, taskId);
      await refreshGroupData();
    } catch (error) {
      console.error('Errore nell\'eliminazione del task:', error);
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
      <h2 className="text-xl dark:text-white font-semibold mb-2">Gruppo: {group.name}</h2>
      <p className="dark:text-gray-300 mb-4">{group.description}</p>

      {/* Membri del gruppo */}
      <div className="mb-6 w-full md:w-[800px]">
        <h3 className="text-lg dark:text-white font-semibold mb-2">Membri del gruppo:</h3>
        <div className="flex flex-wrap gap-4">
          {group.members.map(member => (      
            <div key={member._id} className="flex flex-col items-center">
              <Avatar
                onClick={() => handleMemberClick(member)} 
                img={member.avatar || "https://via.placeholder.com/150"} 
                alt={`${member.nome} ${member.cognome}`}
                size="lg"
                className='cursor-pointer' 
                rounded
              />
              <button 
                onClick={() => handleMemberClick(member)}
                className="mt-2 text-sm dark:text-white hover:underline"
              >
                {member.nome} {member.cognome}
              </button>
              {selectedMember === member && (
                <div className="mt-2 text-xs dark:text-gray-300">
                  <p>{member.email}</p>
                  {isCreator && member._id !== userData._id && (
                    <Button 
                      color="failure" 
                      size="xs" 
                      onClick={() => handleRemoveUser(member._id)}
                      className="mt-1"
                    >
                      Rimuovi
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-center'>
        <button onClick={() => setShowInviteForm(true)} 
        className="mt-4 fade-in h-10 flex justify-center items-center px-4 py-6 dark:text-white border border-emerald-500 rounded-lg shadow-[inset_0px_0px_12px] shadow-emerald-600 hover:shadow-[inset_0px_0px_16px] hover:shadow-emerald-400 transition-all ease-in-out duration-500 hover:scale-105">
          Invita Utente
        </button>
        {isCreator ? (
          <button onClick={() => setShowDeleteModal(true)} 
          className="mt-4 ml-2 fade-in h-10 flex justify-center items-center px-4 py-6 dark:text-white border border-red-500 rounded-lg shadow-[inset_0px_0px_12px] shadow-red-600 hover:shadow-[inset_0px_0px_20px] hover:shadow-red-700 transition-all ease-in-out duration-500">
            Elimina Gruppo
          </button>
        ) : (
          <button onClick={handleLeaveGroup} className="mt-4 ml-2 fade-in h-10 flex justify-center items-center px-4 py-6 dark:text-white border border-cyan-500 rounded-lg shadow-[inset_0px_0px_12px] shadow-cyan-600 hover:shadow-[inset_0px_0px_16px] hover:shadow-cyan-400 transition-all ease-in-out duration-500 hover:scale-105">
            Abbandona Gruppo
          </button>
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
        <div className="w-full fade-in">
        <Calendar 
          tasks={group.tasks} 
          onSelectDate={(date) => {
            console.log('Data selezionata in Calendar:', date);
            setSelectedDate(date);
          }}
        />
        </div>
        <div className="w-62">
          <TaskList 
            tasks={group.tasks.filter(task => 
              new Date(task.scheduledDate).toDateString() === selectedDate.toDateString()
            )}
            onCreateTask={(taskData) => handleCreateTask({...taskData, scheduledDate: selectedDate})}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            selectedDate={selectedDate}
          />
        </div>
      </div>
      
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