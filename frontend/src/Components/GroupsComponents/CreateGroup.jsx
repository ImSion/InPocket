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
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col items-center gap-2">
      <input
        type="text"
        placeholder="Nome del gruppo"
        value={groupData.name}
        onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
        className='p-3 rounded-lg w-72 bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105'
        required
      />
      <input
        type="text"
        placeholder="Descrizione"
        value={groupData.description}
        onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
        className='p-3 rounded-lg w-72 bg-white shadow-[inset_0px_0px_10px] hover:shadow-[inset_0px_0px_16px] dark:text-white dark:border-sky-500 dark:bg-transparent dark:shadow-[inset_0px_0px_10px] dark:shadow-sky-500 transition-all ease-in-out duration-500 cursor-pointer dark:hover:shadow-[inset_0px_0px_18px] dark:hover:shadow-sky-500 hover:scale-105'
      />
      <div className='w-full px-10 flex items-center justify-between'>
        <button type="submit" className="bg-sky-500 w-20 text-white px-4 py-2 rounded-lg">Crea</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded-lg ml-2">Annulla</button>
      </div>
    </form>
  );
}