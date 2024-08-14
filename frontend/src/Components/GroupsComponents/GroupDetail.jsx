import React, { useState } from 'react';
import { updateGroup, inviteToGroup, createTask, updateTask } from '../../Modules/ApiCrud';
import TaskList from './TaskList';
import InviteForm from './InviteForm';

export default function GroupDetail({ group, onUpdate }) {
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = async (email) => {
    try {
      await inviteToGroup(group._id, email);
      onUpdate();
    } catch (error) {
      console.error('Errore nell\'invito dell\'utente:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(group._id, taskData);
      onUpdate();
    } catch (error) {
      console.error('Errore nella creazione del task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await updateTask(group._id, taskId, taskData);
      onUpdate();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del task:', error);
    }
  };

  return (
    <div className="w-2/3 pl-4">
      <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
      <p>{group.description}</p>
      <button 
        onClick={() => setShowInviteForm(true)}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Invita Utente
      </button>
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
    </div>
  );
}