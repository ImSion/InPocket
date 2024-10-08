import React, { useState } from 'react';
import { Button, Modal, TextInput } from 'flowbite-react';

export default function TaskList({ tasks, onCreateTask, onUpdateTask, onDeleteTask, selectedDate }) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (newTaskDescription.trim()) {
      onCreateTask({ 
        description: newTaskDescription.trim(),
        scheduledDate: selectedDate 
      });
      setNewTaskDescription('');
    }
  };

  const handleCompleteTask = (task) => {
    if (!task.completed) {
      setCurrentTask(task);
      setCompletionNote(task.completionNote || '');
      setShowUpdateModal(true);
    } else {
      onUpdateTask(task._id, { completed: false, completionNote: '' });
    }
  };

  const handleUpdateTask = () => {
    onUpdateTask(currentTask._id, { completed: true, completionNote });
    setShowUpdateModal(false);
  };

  const handleDeleteTask = (taskId) => {
    onDeleteTask(taskId);
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <h3 className="text-lg dark:text-white font-semibold mt-4 mb-2">Tasks per {selectedDate.toLocaleDateString()}</h3>
      <form onSubmit={handleCreateTask} className="mb-4 flex">
        <TextInput
          type="text"
          placeholder="Nuovo task"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="mr-2 w-[220px] rounded-lg bg-white bg-opacity-30"
          required
        />
        <button type="submit" className='border dark:border-white text-black dark:text-white p-2 px-4 rounded-lg shadow-[inset_0px_0px_10px] shadow-white hover:shadow-[inset_0px_0px_20px] hover:shadow-white dark:hover:shadow-[inset_0px_0px_16px] dark:hover:shadow-sky-500 transition-all ease-in-out duration-500'>Aggiungi</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleCompleteTask(task)}
              className="mr-2"
            />
            <span 
              className={`flex-grow cursor-pointer dark:text-white text-black ${task.completed ? 'line-through' : ''}`}
              onClick={() => setSelectedTaskId(selectedTaskId === task._id ? null : task._id)}
            >
              {task.description}
            </span>
            {task.completed && task.completionNote && (
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">({task.completionNote})</span>
            )}
            {selectedTaskId === task._id && (
              <Button 
                color="failure" 
                size="xs" 
                onClick={() => handleDeleteTask(task._id)}
                className="ml-2"
              >
                Elimina
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Modal show={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <Modal.Header>Completa Task</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Aggiungi un commento per completare questa task:
            </p>
            <TextInput
              type="text"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Inserisci un commento"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdateTask}>Completa</Button>
          <Button color="gray" onClick={() => setShowUpdateModal(false)}>
            Annulla
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}