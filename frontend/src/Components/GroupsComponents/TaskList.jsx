import React, { useState } from 'react';

export default function TaskList({ tasks, onCreateTask, onUpdateTask }) {
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    onCreateTask({ description: newTaskDescription });
    setNewTaskDescription('');
  };

  const handleCompleteTask = (taskId, completed) => {
    onUpdateTask(taskId, { completed });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mt-4 mb-2">Tasks</h3>
      <form onSubmit={handleCreateTask} className="mb-4">
        <input
          type="text"
          placeholder="Nuovo task"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Aggiungi</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleCompleteTask(task._id, !task.completed)}
              className="mr-2"
            />
            <span className={task.completed ? 'line-through' : ''}>{task.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}