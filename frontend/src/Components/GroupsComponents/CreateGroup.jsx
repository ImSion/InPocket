import React, { useState } from 'react';

export default function CreateGroupForm({ onSubmit, onCancel }) {
  const [groupData, setGroupData] = useState({ name: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupData.name.trim()) {
      alert('Il nome del gruppo è obbligatorio');
      return;
    }
    onSubmit(groupData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Nome del gruppo"
        value={groupData.name}
        onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
        className="border p-2 mr-2"
        required
      />
      <input
        type="text"
        placeholder="Descrizione"
        value={groupData.description}
        onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
        className="border p-2 mr-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Crea</button>
      <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded ml-2">Annulla</button>
    </form>
  );
}